import child_process from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

export function getRepoDir() {
    return new Promise(resolve => {
        child_process.exec("git rev-parse --show-toplevel", (error, stdout, stderr) =>
            resolve(path.resolve(stdout.trimEnd()))
        );
    });
}
const repoDir = await getRepoDir();

const uploadsDir = path.join(repoDir, "uploads");
const badgerUploadPath = path.join(uploadsDir, "badger.jpg");
const beaverUploadPath = path.join(uploadsDir, "beaver.jpg");
const dogUploadPath = path.join(uploadsDir, "dog.jpg");
const owlUploadPath = path.join(uploadsDir, "owl.jpg");

const resourcesDir = path.join(repoDir, "test", "resources");
const badgerPath = path.join(resourcesDir, "badger.jpg");
const beaverPath = path.join(resourcesDir, "beaver.jpg");
const dogPath = path.join(resourcesDir, "dog.jpg");
const owlPath = path.join(resourcesDir, "owl.jpg");

const dbResetPath = path.join(repoDir, "facial-analytics.sql");
const dbTestPath = path.join(repoDir, "test", "resources", "test.sql");

export function applySql(path) { return new Promise(resolve => {
    child_process.exec(
        `mariadb --user=test_user --password=password -D fa < ${path}`,
        (error, stdout, stderr) => {
            resolve([error, stdout, stderr]);
        }
    );
})}


export async function resetUploads() {
    const oldFileNames = await fs.readdir(uploadsDir);
    const deletePromises = oldFileNames.map(oldFileName =>
        fs.unlink(path.join(uploadsDir, oldFileName))
    );
    await Promise.all(deletePromises);

    const copyPromises = [
        [badgerPath, badgerUploadPath],
        [beaverPath, beaverUploadPath],
        [dogPath, dogUploadPath],
        [owlPath, owlUploadPath],
    ].map(
        ([srcPath, destPath]) => fs.copyFile(srcPath, destPath)
    )
    await Promise.all(copyPromises);
}

export async function resetDb() {
    console.debug('Beginning reset database.');
    await applySql(dbResetPath);
    await applySql(dbTestPath);
    console.info('Reset database OK');
}