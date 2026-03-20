const { query } = require("./db");

async function checkRutTien() {
    try {
        const result = await query("SELECT * FROM RutTien");
        console.log("Current RutTien data:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkRutTien();
