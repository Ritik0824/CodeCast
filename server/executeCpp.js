const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath) => {
    const jobId = path.basename(filePath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.out`);

    return new Promise((resolve, reject) => {
        const command = `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`;

        console.log("Executing command:", command);  // Log the executed command for debugging

        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Log error details to see what is happening
                console.error("Execution error:", error);
                console.error("Standard error:", stderr);
                return reject({ error: error.message || "Unknown error occurred during execution", stderr });
            }

            if (stderr) {
                // Log any standard error output for better clarity
                console.error("Standard error output:", stderr);
                return reject({ error: stderr });
            }

            console.log("Execution success:", stdout);  // Log successful output
            resolve(stdout);  // Resolve with the successful output
        });
    });
};

module.exports = {
    executeCpp,
};