import child_process from 'node:child_process';

const REMOTE='root@test.fa.mpeschel10.com';
const REMOTE_TEST=REMOTE + ':/opt/fa-test';

function liveExec(program, args) {
    return new Promise((resolve, reject) => {
        try {
            const ps = child_process.spawn(program, args);
            ps.stdout.on('data', data => process.stdout.write(data));
            ps.stdout.on('close', () => resolve());
            ps.stderr.on('data', data => process.stderr.write(data));
        } catch(error) {
            reject(error);
        }
    })
}

const commands = [
    ['ssh', [REMOTE, 'echo "Yes, I think"'], 'Sanity check. Are we logged in?'],
    ['ssh', [REMOTE, 'apt-get update'], 'Get list of packages to upgrade.'],
    ['ssh', [REMOTE, 'apt-get upgrade -y'], 'Blindly upgrade everything. Hope nothing breaks...'],
    ['ssh', [REMOTE, 'mkdir', '-p', '/opt/fa-test/']],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git init']],
    // ['git', ['remote', 'add', 'test', REMOTE_TEST]],
    ['git', ['remote', 'set-url', 'test', REMOTE_TEST]],
    ['git', ['push', 'test', 'main']],
];

for (const [program, args, description] of commands) {
    if (description) console.log('Doing:', description);
    await liveExec(program, args);
    console.log();
}
