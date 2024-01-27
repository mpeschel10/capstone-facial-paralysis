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
    // ['ssh', [REMOTE, 'echo "Yes, I think we\'re logged in."'], 'Sanity check. Are we logged in?'],
    // ['ssh', [REMOTE, 'apt-get update'], 'Get list of packages to upgrade.'],
    // ['ssh', [REMOTE, 'apt-get upgrade -y'], 'Blindly upgrade everything. Hope nothing breaks...'],
    
    // ['git', ['remote', 'add', 'test', REMOTE_TEST], 'Tell next.js repo the server\'s address for the first time.'],
    // ['git', ['remote', 'set-url', 'test', REMOTE_TEST], 'Tell next.js repo the server\'s address.'],
    
    // ['ssh', [REMOTE, 'mkdir', '-p', '/opt/fa-test/'], 'Create folder for next.js server so we can push to it.'],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git init'], 'Create git repository for next.js server so we can push to it.'],
    // ['git', ['push', 'test', 'main'], 'Stage next.js main branch on server for the first time.'],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && git checkout -b production'], 'Create new production branch because git dislikes pushing to main while main is checked out.'],
    
    // ['ssh', [REMOTE, 'cd /etc/systemd/system && ln -s /opt/fa-test/deployment/fa-test-server.service'], 'Tell systemd where fa-test-server.service is.'],
    // ['ssh', [REMOTE, 'systemctl daemon-reload'], 'Reload fa-test-server.service in case it changed.'],
    // ['ssh', [REMOTE, 'systemctl enable --now fa-test-server'], 'Set next.js to run on boot.'],

    ['ssh', [REMOTE, 'cd /etc/nginx/sites-available && ln -s /opt/fa-test/deployment/facial-analytics.conf'], 'Tell nginx where facial-analytics.conf is.'],
    ['ssh', [REMOTE, 'cd /etc/nginx/sites-enabled && ln -s /etc/nginx/sites-available/facial-analytics.conf'], 'Enable facial-analytics in nginx.'],

    ['git', ['push', 'test', 'main'], 'Stage next.js main branch on server.'],
    ['ssh', [REMOTE, 'cd /opt/fa-test && git merge main'], 'Merge staged main branch into live production.'],
    // ['ssh', [REMOTE, 'cd /opt/fa-test && npm i'], 'NPM install next.js server.']',
    // ['ssh', [REMOTE, 'cd /opt/fa-test && npm run build'], 'Build next.js server.'],
    // ['ssh', [REMOTE, 'systemctl restart fa-test-server'], 'Restart next.js server.'],
    ['ssh', [REMOTE, 'nginx -t && nginx -s reload'], 'Restart Nginx.'],
];

for (const [program, args, description] of commands) {
    if (description) console.log('Doing:', description);
    await liveExec(program, args);
    console.log();
}
