import inspect
import shutil, subprocess

import logging
logger = logging.getLogger("test")

from pathlib import Path
def get_repo_dir():
    return Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode('utf-8').strip())
repo_dir = get_repo_dir()

test_dir = repo_dir.joinpath('test')
uploads_dir = repo_dir.joinpath('uploads')
badger_upload_path = uploads_dir.joinpath('badger.jpg')
beaver_upload_path = uploads_dir.joinpath('beaver.jpg')
dog_upload_path = uploads_dir.joinpath('dog.jpg')
owl_upload_path = uploads_dir.joinpath('owl.jpg')

cat_image_path = test_dir.joinpath('resources', 'cat.jpg')
badger_image_path = test_dir.joinpath('resources', 'badger.jpg')
beaver_image_path = test_dir.joinpath('resources', 'beaver.jpg')
dog_image_path = test_dir.joinpath('resources', 'dog.jpg')
owl_image_path = test_dir.joinpath('resources', 'owl.jpg')

db_reset_path = repo_dir.joinpath('facial-analytics.sql')
db_test_data_path = test_dir.joinpath('resources', 'test.sql')

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


def eq(left, right):
    return left == right

def subseteq(left, right):
    for lkey, lvalue in left.items():
        if not lkey in right:
            return False
        if not lvalue == right[lkey]:
            return False
    return True

def test(test_name, observed_str, expected=None, expected_str=None, comparison=eq):
    if expected == None and expected_str == None:
        raise Exception(f'Bad test {test_name}; both expected and expected_str are None.')
    if expected != None and expected_str != None:
        raise Exception(f'Bad test {test_name}; both expected and expected_str are not None.')
    
    
    logger.debug(f'Begin test {test_name}')
    context_locals = inspect.currentframe().f_back.f_locals
    context_globals = inspect.currentframe().f_back.f_globals
    # logger.debug(f'Calling locals: {context_locals}')
    if expected_str != None:
        expected = eval(expected_str, context_globals, context_locals)
    observed = eval(observed_str, context_globals, context_locals)

    if not comparison(expected, observed):
        if expected_str is None:
            logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        else:
            logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        return False

    return True


def apply_sql(path):
    with path.open('rb') as sql_file:
        buffer = sql_file.read()
        p = subprocess.Popen(['mariadb', '--user=test_user', '--password=password', '-D', 'fa'], stdin=subprocess.PIPE)
        p.communicate(buffer)

def reset_db():
    logger.debug('Beginning reset database.')
    apply_sql(db_reset_path)
    apply_sql(db_test_data_path)
    logger.info('Reset database OK')

def reset_uploads():
    for path in uploads_dir.iterdir():
        path.unlink()
    shutil.copyfile(badger_image_path, badger_upload_path)
    shutil.copyfile(beaver_image_path, beaver_upload_path)
    shutil.copyfile(dog_image_path, dog_upload_path)
    shutil.copyfile(owl_image_path, owl_upload_path)

