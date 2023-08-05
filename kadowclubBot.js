const { Builder, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const nodemailer = require('nodemailer');
const smtpConfig = require('./smtp.json');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
// Liste de noms masculins et féminins
const names = ["Maxime", "Sophie", "Julien", "Claire", "Guillaume", "Élise", "Mathieu", "Camille", "Nicolas", "Chloé"];

// Sélectionne un nom aléatoirement dans la liste
function getRandomName() {
  return names[Math.floor(Math.random() * names.length)];
}

// Utilisation dans la partie de votre code

async function sendEmail(emailaddress, winningText, screenshot) {
  let transporter = nodemailer.createTransport({
    host: smtpConfig.Smtp.Host,
    port: smtpConfig.Smtp.Port,
    auth: {
      user: smtpConfig.Smtp.Identifiant,
      pass: smtpConfig.Smtp.Pass
    }
  });

  let info = await transporter.sendMail({
    from: smtpConfig.Smtp.Identifiant,
    to: "killian.stein@icloud.com",
    subject: `Gagné: ${winningText}`,
    text: `Adresse Email: ${emailaddress}\nGagné: ${winningText}`,
    attachments: [{
      filename: 'screenshot.png',
      path: './screenshot.png' // Chemin vers le fichier
    }]
  });

  console.log("Message sent: %s", info.messageId);
}

async function MenphisBot() {

  // try {
  //   exec("pkill -f chrome");
  // } catch { }
  let browser;
  try {
    let options = new Options();
    options.addArguments('user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1');
    browser = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    let emailaddress = "";
    await browser.get("https://g.kadow.club/?venueId=6299fa4a8232143f18aacb2b&placeName=Memphis%20METZ%20SEMECOURT&utm_source=qrcode");
    await sleep(5000);
    await browser.findElement(By.xpath("/html/body/div/div[2]/div[3]/a/span")).click();
    await sleep(5000);
    await browser.findElement(By.xpath("/html/body/div[3]/div/div/div/div/div/div[3]/a/span")).click();
    await sleep(5000);

    try {
      await browser.findElement(By.xpath("/html/body/div[1]/div[2]/div[4]/div[2]/div[4]/div/a")).click();
    } catch { }

    await sleep(5000);
    let tabs = await browser.getAllWindowHandles();
    await browser.switchTo().window(tabs[0]);
    await sleep(10000);
    await browser.findElement(By.xpath("/html/body/div[1]/div[2]/div[2]/div[3]/a/span")).click();
    await sleep(30000);

    try {
      const randomName = getRandomName();
      await browser.findElement(By.xpath("/html/body/div[3]/div/div/div/div/div/form/div[1]/div/div/input")).sendKeys(randomName, Key.RETURN);

      await sleep(2000);

      await browser.executeScript('window.open("newURL");');
      let tab = await browser.getAllWindowHandles();
      await browser.switchTo().window(tab[2]);
      await browser.get("https://www.mohmal.com/fr");
      await sleep(5000);
      await browser.findElement(By.xpath("/html/body/div[1]/main/div[1]/div[3]/a")).click();
      await sleep(5000);
      let emailElement = await browser.findElement(By.xpath("/html/body/div/div[1]/div[2]/div[3]/div[1]"));
      emailaddress = await emailElement.getAttribute('data-email');
      console.log(emailaddress);
    } catch (error) {
      await browser.quit();
      await MenphisBot();
    }

    await sleep(5000);
    await browser.switchTo().window(tabs[0]);
    await sleep(3000);
    await browser.findElement(By.xpath("/html/body/div[3]/div/div/div/div/div/form/div[2]/div/div/input")).sendKeys(emailaddress, Key.RETURN);
    await sleep(3000);
    await sleep(5000);

    try {
      tabs = await browser.getAllWindowHandles();
      await browser.switchTo().window(tabs[2]);
    } catch (error) {
      console.log(error); await browser.quit();
      await MenphisBot();
    }

    await sleep(5000);
    await browser.findElement(By.xpath("//html/body/div/div[1]/div[3]/div[2]/div/a")).click();
    await sleep(5000);
    await browser.findElement(By.xpath("/html/body/div/div[1]/div[6]/table/tbody/tr/td[1]/a")).click();
    await sleep(15000);

    try {
      let pageSource = await browser.getPageSource();
      let match = pageSource.match(/vous avez gagné(.*?)!/);
      let winningText = match && match[0] ? match[0] : '';
      await browser.executeScript("window.scrollBy(0,500)");
      let screenshot = await browser.takeScreenshot();
      require('fs').writeFileSync('screenshot.png', screenshot, 'base64');
      await sendEmail(emailaddress, winningText); // Send email
    } catch (e) {
      console.log('Erreur lors de la récupération du texte', e);
    }
  } catch (e) {
    await browser.quit();
    console.log(e);
    await MenphisBot(); // Redémarre la fonction en cas d'erreur
  } finally {
    if (browser) {
      await browser.quit();
      await MenphisBot(); // Redémarre la fonction en cas d'erreur

    }
  }
}

async function main() {
  while (true) {
    await MenphisBot();
  }
}

main().catch(err => console.error(err));

