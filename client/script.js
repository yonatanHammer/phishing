const screenshot = async(mac) => {
    try {
        const canvas = await html2canvas(document.body)
        const imageDataUrl = canvas.toDataURL('image/png');
        await fetch('http://127.0.0.1:4000/screenshot', {
         method: 'POST',
         body: JSON.stringify({ screenshot: imageDataUrl, mac}),
         headers: {
         'Content-Type': 'application/json',
         },
       })
     } catch(err) {
         console.log(err)
     }
}


async function getMac () {
  try {
      const response = await fetch('http://127.0.0.1:4000/macaddress');
      
      if (response.ok) {
          const {mac} = await response.json(); 
         const element = document.getElementById('mac')
         element.innerText = `your MacAddress is : ${mac}` 
         await screenshot(mac)
      } else {
          console.log(`Error: ${response.status} - ${response.statusText}`);
          element.innerText = `Cant find MacAddress ... ` 
      }
  } catch (err) {
      console.log(err);
  }
}

getMac()


