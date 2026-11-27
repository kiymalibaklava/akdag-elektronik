import glob

files = ['behringer.svg', 'db-technologies.svg', 'jbl.svg', 'mackie.svg', 'martin-audio.svg', 'rcf.svg', 'sennheiser.svg', 'shure.svg', 'soundcraft.svg', 'yamaha.svg']

for f in files:
    path = 'public/brands/' + f
    with open(path, 'r', encoding='utf-8') as fp:
        c = fp.read()
    print('=== ' + f + ' ===')
    print(c[:400].replace('\n', ' '))
