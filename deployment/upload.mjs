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
    // ['ssh', [REMOTE, 'echo "Yes, I think"'], 'Sanity check. Are we logged in?'],
    // ['ssh', [REMOTE, 'apt-get update'], 'Get list of packages to upgrade.'],
    // ['ssh', [REMOTE, 'apt-get upgrade -y'], 'Blindly upgrade everything. Hope nothing breaks...'],
    
    // ['git', ['remote', 'add', 'test', REMOTE_TEST]],
    // ['git', ['remote', 'set-url', 'test', REMOTE_TEST]],
    
    // ['ssh', [REMOTE, 'mkdir', '-p', '/opt/fa-test/']],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git init']],
    // ['git', ['push', 'test', 'main']],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git checkout -b production']],
    
    ['ssh', [REMOTE, 'cd /etc/systemd/system && ln -s /opt/fa-test/deployment/fa-test-server.service']],
    ['ssh', [REMOTE, 'systemctl daemon-reload']],
    ['ssh', [REMOTE, 'systemctl enable --now fa-test-server']],

    // ['git', ['push', 'test', 'main']],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git merge main']],
    ['ssh', [REMOTE, 'cd /opt/fa-test && npm i']],
    ['ssh', [REMOTE, 'cd /opt/fa-test && npm run build']],
    ['ssh', [REMOTE, 'systemctl restart fa-test-server']],
];

for (const [program, args, description] of commands) {
    if (description) console.log('Doing:', description);
    await liveExec(program, args);
    console.log();
}
