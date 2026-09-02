from pathlib import Path
import json

PET = 'https://pet-nika.mirozdanie6v.workers.dev'
PET_BROKEN_ALIAS = PET + '/miniapp'
UNIQ = 'https://uniq-smart-rent.mirozdanie6v.workers.dev'


def read_json(path, marker):
    text = path.read_text(encoding='utf-8')
    start = text.index(marker) + len(marker)
    end = text.index('</script>', start)
    return json.loads(text[start:end].strip().rstrip(';'))


def require(condition, message):
    if not condition:
        raise SystemExit('QA FAIL: ' + message)

# Main + preview
for name in ('index.html', 'preview.html'):
    data = read_json(Path('public') / name, 'window.SITE_I18N=')
    for lang in ('ru', 'en', 'vi'):
        items = {x.get('name'): x for x in data[lang].get('protoItems', [])}
        require('PET NIKA' in items, f'{name} {lang}: PET NIKA card missing')
        require('UNIQ SMART RENT' in items, f'{name} {lang}: UNIQ card missing')
        pet_urls = {x.get('url') for x in items['PET NIKA'].get('live', [])}
        uniq_urls = {x.get('url') for x in items['UNIQ SMART RENT'].get('live', [])}
        require(PET + '/' in pet_urls, f'{name} {lang}: PET verified prototype link missing')
        require(PET_BROKEN_ALIAS not in pet_urls, f'{name} {lang}: broken PET /miniapp alias must not be published')
        require(items['PET NIKA'].get('caseUrl') == 'cases/pet-nika.html', f'{name} {lang}: PET case link wrong')
        require(UNIQ + '/' in uniq_urls, f'{name} {lang}: UNIQ live link missing')
        require(items['UNIQ SMART RENT'].get('caseUrl') == 'cases/uniq-smart-rent.html', f'{name} {lang}: UNIQ case link wrong')

# Prototypes library
data = read_json(Path('public/prototypes.html'), 'window.PROTOTYPE_I18N=')
for lang in ('ru', 'en', 'vi'):
    items = {x.get('name'): x for x in data[lang].get('items', [])}
    pet_urls = {x.get('url') for x in items['PET NIKA'].get('live', [])}
    require(PET + '/' in pet_urls, f'prototypes {lang}: PET verified prototype missing')
    require(PET_BROKEN_ALIAS not in pet_urls, f'prototypes {lang}: broken PET /miniapp alias must not be published')
    require(items['PET NIKA'].get('caseUrl') == 'cases/pet-nika.html', f'prototypes {lang}: PET case wrong')
    require(UNIQ + '/' in {x.get('url') for x in items['UNIQ SMART RENT'].get('live', [])}, f'prototypes {lang}: UNIQ root missing')
    require(items['UNIQ SMART RENT'].get('caseUrl') == 'cases/uniq-smart-rent.html', f'prototypes {lang}: UNIQ case wrong')

# Dedicated cases
pet_case = Path('public/cases/pet-nika.html')
uniq_case = Path('public/cases/uniq-smart-rent.html')
require(pet_case.is_file(), 'PET case file missing')
require(uniq_case.is_file(), 'UNIQ case file missing')

pet_data = read_json(pet_case, 'window.CASE_DATA=')
uniq_data = read_json(uniq_case, 'window.CASE_DATA=')
for lang in ('ru', 'en', 'vi'):
    pet_urls = {x.get('url') for x in pet_data[lang].get('liveProducts', [])}
    uniq_urls = {x.get('url') for x in uniq_data[lang].get('liveProducts', [])}
    require(PET + '/' in pet_urls, f'PET case {lang}: verified prototype missing')
    require(PET_BROKEN_ALIAS not in pet_urls, f'PET case {lang}: broken /miniapp alias must not be published')
    require(UNIQ + '/' in uniq_urls, f'UNIQ case {lang}: root missing')

print('QA PASS: verified PET NIKA and UNIQ SMART RENT links are present on main, preview, prototypes and case pages.')
