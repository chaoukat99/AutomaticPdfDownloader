const puppeteer = require('puppeteer');
const path = require("path");
const {exec}=require("child_process");

(async () => {

  const browser = await puppeteer.launch({
    headless: false, 
  });


  const page = await browser.newPage();

const All_Links=[];
for(let i =0;i<2;i++){
 await page.goto(`https://jurisprudence-ohada.com/category/jurisprudences/page/${i+1}/`, {
    waitUntil: 'networkidle2', 
  });
  const links = await page.$$eval('.pagelayer-wposts-featured a', elements => 
    elements.map(el => el.href)
  );
  
const pdfLinks = [];

if(links.length>0){
   for(let link of links) {
    try {
      await page.goto(link, { waitUntil: 'networkidle2' });

      
      const pdfLink = await page.$eval(
        '.entry-content.pagelayer-post-excerpt a[href$=".pdf"]',
        el => el.href
      );

      console.log(`PDF found: ${pdfLink}`);
      pdfLinks.push(pdfLink);
    } catch (error) {
      console.error(`Error processing ${link}:`, error);
    }
  }

  All_Links.push(pdfLinks);


   
    
}


}

 
console.log(All_Links);


    const outputDir = './pdfs'; 
   
    for (let i = 0; i < All_Links.length; i++) {
        for (let j = 0; j < All_Links[i].length; j++) {
            downloadPdf(All_Links[i][j], outputDir);

        }
      }
  
  await browser.close();
})();





function downloadPdf(pdfUrl, outputDir) {
    const fileName = path.basename(pdfUrl); // Extracts the file name from the URL
    const outputPath = path.join(outputDir, fileName);
  
    const curlCommand = `curl -o "${outputPath}" "${pdfUrl}"`;
  
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error downloading ${pdfUrl}:`, error);
        return;
      }
      console.log(`Downloaded: ${pdfUrl} -> ${outputPath}`);
    });
  }