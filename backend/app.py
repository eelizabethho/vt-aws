import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

VT_URL = 'https://apps.es.vt.edu/ssb/HZSKVTSC.P_ProcRequest'

TERM_YEAR = '202501'  # Spring 2025 — change to current term

def fetch_sections(subject, class_number=''):
    payload = {
        'BTN_PRESSED': 'FIND class sections',
        'CAMPUS': '0',
        'TERMYEAR': TERM_YEAR,
        'CORE_CODE': 'AR%',
        'subj_code': subject,
        'CRSE_NUMBER': class_number,
        'crn': '',
        'open_only': '',
    }
    try:
        r = requests.post(VT_URL, data=payload, timeout=10)
        r.raise_for_status()
    except Exception as e:
        return None, str(e)

    from html.parser import HTMLParser

    class VTParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.sections = []
            self.in_table = False
            self.current_row = []
            self.current_cell = ''
            self.cell_count = 0

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == 'tr':
                self.current_row = []
            if tag == 'td':
                self.current_cell = ''

        def handle_endtag(self, tag):
            if tag == 'td':
                self.current_row.append(self.current_cell.strip())
            if tag == 'tr' and len(self.current_row) >= 13:
                row = self.current_row
                try:
                    self.sections.append({
                        'crn':        row[0],
                        'courseKey':  f"{row[1]} {row[2]}",
                        'title':      row[4],
                        'lectureType': row[5],
                        'credits':    row[6],
                        'capacity':   row[7],
                        'instructor': row[8],
                        'days':       row[9].replace(' ', ''),
                        'startTime':  convert_time(row[10]),
                        'endTime':    convert_time(row[11]),
                        'location':   row[12],
                    })
                except Exception:
                    pass

        def handle_data(self, data):
            self.current_cell += data

    def convert_time(t):
        # VT returns times like "8:00AM" or "1:30PM"
        t = t.strip()
        if not t or t == '(ARR)':
            return '00:00'
        try:
            from datetime import datetime
            return datetime.strptime(t, '%I:%M%p').strftime('%H:%M')
        except Exception:
            try:
                return datetime.strptime(t, '%I:%M %p').strftime('%H:%M')
            except Exception:
                return t

    parser = VTParser()
    parser.feed(r.text)

    # Filter out header rows (crn should be numeric)
    valid = [s for s in parser.sections if s['crn'].isdigit() and s['days']]
    return valid, None


@app.route('/api/search')
def search():
    subject = request.args.get('subject', '').upper().strip()
    number  = request.args.get('number', '').strip()
    if not subject:
        return jsonify({'error': 'subject is required'}), 400

    sections, err = fetch_sections(subject, number)
    if err:
        return jsonify({'error': err}), 503
    if not sections:
        return jsonify([])

    # Group by courseKey
    grouped = {}
    for sec in sections:
        key = sec['courseKey']
        if key not in grouped:
            grouped[key] = {'title': sec['title'], 'credits': sec['credits'], 'sections': []}
        grouped[key]['sections'].append({
            'crn':        sec['crn'],
            'location':   sec['location'] or 'TBA',
            'startTime':  sec['startTime'],
            'endTime':    sec['endTime'],
            'days':       sec['days'],
            'instructor': sec['instructor'],
        })

    return jsonify([[k, v] for k, v in grouped.items()])


if __name__ == '__main__':
    app.run(port=5000, debug=True)
