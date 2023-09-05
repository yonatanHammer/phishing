const express = require('express');
const cors = require('cors');
const macaddress = require('macaddress');
const fs = require('fs');
const path = require('path');


const port = 4000;
const app = express();


app.use(cors());
app.use(express.json()); 

const macAddressesFile = 'mac_addresses.json';

// Initialize an array to store MAC addresses
let macAddresses = [];

// Load existing MAC addresses from the file, if it exists
if (fs.existsSync(macAddressesFile)) {
    try {
        const data = fs.readFileSync(macAddressesFile, 'utf8');
        macAddresses = JSON.parse(data);
    } catch (err) {
        console.error('Error reading mac_addresses.json:', err);
    }
}

app.get('/macaddress', (_, res) => {
    console.log('enter ')
    macaddress.one((err, mac) => {
        if (err) {
            res.status(500).json({ message: 'Couldn\'t get mac address' });
        } else {
            // Check if the MAC address is not in the array
            if (!macAddresses.find(m => m.mac === mac)) {
                // Save the new MAC address
                macAddresses.push({mac, time: new Date()});

                // Save the updated array to the file
                fs.writeFileSync(macAddressesFile, JSON.stringify(macAddresses, null, 2));
            }
            res.status(200).json({ mac });
        }
    });
});

app.get('/allmacaddresses', (_, res) => {
    // Return the array of all saved MAC addresses
    res.status(200).json({ macAddresses });
});

app.post('/screenshot', (req, res) => {
    const { screenshot, mac } = req.body;

    // Check if the MAC address is in the array
    const macExists = macAddresses.find((m) => m.mac === mac);

    if (macExists) {
        // Check if there is already an image associated with the MAC address
        if (!macExists.image) {
            const base64Image = screenshot.split('base64,').pop();
            const fileName = `${mac}.png`; // Use MAC address as the filename
            const filePath = path.join(__dirname, 'screenshots', fileName); // Save inside the "screenshots" folder
            fs.writeFile(filePath, base64Image, { encoding: 'base64' }, (err) => {
                if (err) {
                    console.error('Error:', err);
                    res.status(500).json({ message: 'Screenshot has not been saved' });
                } else {
                    macExists.image = filePath;
                    fs.writeFileSync(macAddressesFile, JSON.stringify(macAddresses, null, 2));
                    res.status(200).json({ message: 'Screenshot has been saved' });
                }
            });
        } else {
            // There's already an image associated with the MAC address
            res.status(200).json({ message: 'Screenshot already exists for this MAC address' });
        }
    } else {
        // MAC address does not exist in the array
        res.status(400).json({ message: 'MAC address not found' });
    }
});



app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});
