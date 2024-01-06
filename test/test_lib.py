import subprocess

from pathlib import Path
def get_repo_dir():
    return Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode('utf-8').strip())
repo_dir = get_repo_dir()

test_dir = repo_dir.joinpath('test')
cat_image_path = test_dir.joinpath('resources', 'cat.jpg')
badger_image_path = test_dir.joinpath('resources', 'badger.jpg')
beaver_image_path = test_dir.joinpath('resources', 'beaver.jpg')
dog_image_path = test_dir.joinpath('resources', 'dog.jpg')
owl_image_path = test_dir.joinpath('resources', 'owl.jpg')

PORT = 3000
SERVER_URL = 'http://127.0.0.1:%d' % PORT

def login(session, username, password):
    session.post(SERVER_URL + '/api/login', data={
        'username': username,
        'password': password,
    })
    
    # For production, the cookies have the HttpOnly attribute, which forbids passing the cookies over Http.
    # For testing, it's all done over http since I don't wanna bother with self-signed certificates.
    # This means the jwt cookie will not get passed along,
    #  so reassign the cookie to discard the HttpOnly attribute.
    token = session.cookies.get('fa-test-session-jwt', domain='127.0.0.1', path='/')
    # Discard the old cookie. This must be done as a separate step.
    session.cookies.set('fa-test-session-jwt', None, domain='127.0.0.1', path='/')
    session.cookies.set('fa-test-session-jwt', token, domain='127.0.0.1', path='/')

def logout(session):
    session.cookies.set('fa-test-session-jwt', None, domain='127.0.0.1', path='/')

