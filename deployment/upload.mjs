import child_process from 'node:child_process';

function exec(command) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if (error !== null) reject(error)
            else resolve({stdout, stderr});
        })
    })
}

function liveExec(program, args) {
    return new Promise((resolve, reject) => {
        const ps = child_process.spawn(program, args);
        ps.stdout.on('data', data => process.stdout.write(data));
        ps.stdout.on('close', () => resolve());
        ps.stderr.on('data', data => process.stderr.write(data));
    })
}

const commands = [
    ['Sanity check. Are we logged in?', 'echo "Yes, I think"'],
    // ['Get list of packages to upgrade.', 'apt-get update'],
    // ['Blindly upgrade everything. Hope nothing breaks...', 'apt-get upgrade -y'],
];

// console.log(await exec(`ssh fa-test ${commands}`));
// console.log(await liveExec('du', ['/']))

for (const [description, command] of commands) {
    console.log('Doing:', description);
    await liveExec('ssh', ['fa-test', command]);
    console.log();
}



