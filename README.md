# Projektbeskrivning
**Erik Hamrin** (eh222ve)

1DV449 Linnéuniversitetet
##Sammanfattning
En responsiv webbsida där användaren kan välja artiklar ur Systembolagets sortiment och fylla i vad motsvarande skulle kosta på en border shop för att slutligen lägga till detta i en "kundvagn".

Användaren väljer vilken border shop man har tänkt handla hos och vad användarens milförbrukning är, och presenteras då med uppskattad kostnad för resan(inkl. varor) och vad motsvarande hade kostat på systembolaget.

##Tekniker
###APIer

* HTML5 Geolocation för att få tillgång till användarens platstjänst.

* Google Geocode för att avgöra vilken stad användaren befinner sig i om användaren tillåter platstjänster.

* Google Directions för att avgöra avståndet mellan användarens stad och bordershoppen.

* Twitter API [@St1Sverige](https://twitter.com/st1sverige)'s twitterfeed för aktuellt bensinpris.

* Systembolaget för att hämta deras produktsortiment.

Vissa APIer är beroende av varandra, t.ex. så används inte Geocode API:et om inte användaren godkänner användandet av HTML5 Geolocation.

####Cachning av API
För att inte belasta API-servrarna för mycket sparas en del data på servern. 

* **Systembolaget** 
 * **Server:** produktsortiment mellanlagras i en SQL-databas i en vecka från första efterfrågan. Denna tidsperiod går att ändra smidigt, att jag valt en vecka beror lite på hur "färsk" data man behöver för sortimentet. De största skillnaderna är nog inte priset, utan produkterna i sig. Och dyker det upp en ny produkt kan det vara trkigt att inte kunna se den på mer än 2 veckor.
 * **Klient:** Produkter användaren har sökt efter cachas lokalt hos användaren för att bibehålla persistens mellan sidladdningar i kundkorgen.
*  **Twitter**
 *  **Server:** Twitter-feeden cachas i en fil på servern i 24h.
 *  **Klient:** Bensinpriserna sparas lokalt hos användaren. Detta uppdateras max 1 gång/dygn. 
* **Google**
 * **Klient:** Alla sökningar görs endast en gång och sparas lokalt hos användaren. 

###Offline
Applikation skall fungera i sin helhet om användaren inte har en internetuppkoppling, d.v.s. ingenting ska krascha.

Detta medför dock restriktioner, för att inte cacha allt för mycket på klientsidan (Systembolagets produktsortiment är på ~10mb) så kan användaren fortsatt söka och de sökningar som gjorts tidigare visas som vanligt. Skulle användaren söka på någonting nytt visas "Kunde inte ansluta till servern" (vilket även visas om servern skulle lägga ner). Om användaren försöker besöka en sida som tidigare inte visats möts denne av en statisk html-sida som informerar om att användaren är offline.

Om användaren tappar internet anslutning till servern meddelas användaren om detta av en banner högst upp på sidan. Här funderade jag på hur det kan störa minst i användandet av applikationen, och implementationen blev att bannern alltid ligger högst upp och förskjuter inget innehåll på sidan i höjdled. Klickar användaren på meddelandet försvinner det.

Skulle användaren återfå sin internetuppkoppling tas det gamla meddelandet bort(om inte användaren gjort det själv) och därefter syns ett nytt meddelande om att anslutningen är tillbaka.

####Service Worker
Offline strategin har implementerats med hjälp av Service Workers vilket har åstadkommit en hel del huvudvärk då detta är helt nytt för mig, likaså promises. Dock är jag väldigt nöjd med resultatet!

Service Workern kollar alltid först om det finns cacheat data, om det finns får användaren se det. Därefter uppdateras cachen så att nästa gång användaren laddar sidan är det färsk data.

Skulle datan inte finnas i cachen hämtas ny data direkt och sparas undan i cachen, misslyckas anropet visas en default "offline"-sida.

**Notis:** Då service workern måste ligga i rootkatalogen kan denne således inte ligga i plugin-mappen för detta projekt. För att se innehållet går det att se på följande [länk](https://github.com/ehamrin/cmsPlugin/blob/master/public/service-worker.js),
likaså [fallback för offline](https://github.com/ehamrin/cmsPlugin/blob/master/public/offline.html)

###Hosting
Applikationen hostas på min egna Apache-server med PHP7. 

Det var ett taktiskt val att använda Service Workers då jag blev tvingad att använda mig utav HTTPS, vilket jag inte gjort tidigare. Jag använder mig utav Let's Encrypt som utfärdare av certifikat och det var intressant att installera detta på servern.

###Ramverk
Serverapplikationen bygger på mitt egna [självinstallerande CMS](https://github.com/ehamrin/cmsPlugin) som är under utveckling, vilket även är min motivation till varför jag använder det. Detta har inneburit att jag har behövt fixa en hel del saker med CMSet parallellt med projektet för att tillfredställa den funktionalitet som saknats. 

CMS'et i sig är modulbaserat där [ALLT](https://github.com/ehamrin/cmsPlugin/tree/master/src/plugin)(adminpanel, pages, slider, inloggning, errorlog m.m.) mer eller mindre är ett plugin och sammanlänkningen sker med Hooks. Målet är att varje plugin skall hålla sig till en mapp som ska kunna självinstalleras. Det som finns i detta repositorie är innehållet i pluginmappen för AlcoholTrip.


##Schematisk bild över applikationens beståndsdelar
![applikationens beståndsdelar](http://1dv449.erikhamrin.se/images/Alkoholrundan.png)

###Klassdiagram

![Klassdiagram](http://1dv449.erikhamrin.se/images/AlcoholRundanClassDiagram.png)

###Översikt av JavaScript objekt
![Översikt av JavaScript objekt](http://1dv449.erikhamrin.se/images/JavaScript.png)

##Säkerhet

###SQL-injections
All kommunikation mot databas sker via prepared statements och tillåter därför ingen otillåten injection.

###XSS
Då användaren inte kan påverka pluginet på servern finns ingen möjlighet till XSS-attacker.
CMSet använder sig av sessioner, däremot har cookien egenskaperna "HTTP-only" och "secure" vilket minskar riskerna att sessions-cookien blir tillgänglig för andra.

###Cross Site Request Forgery
CMS'et i sig är för tillfället öppen för attacker med CSRF i adminpanelen, detta är ingenting som hunnits med att åtgärda under projektets gång utan kommer att fixas i ett senare skede med [Synchronizer Token Pattern](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29_Prevention_Cheat_Sheet). 

Är det publika formulär, såsom kontaktformulär skulle det vara en möjlig lösning att använda CAPTCHA (eller liknande). Nackdelen med CAPTCHA är att det kan vara frustrerande för en "snäll" användare som har syn- eller lässvårigheter. Även om CAPTCHA inte är listat som ett likvärdigt alternativ enligt [w3.org](https://www.w3.org/TR/turingtest/) skulle det i detta fall uppfylla samma funktion då det hindrar användaren från att dubbelposta formuläret och det hindrar CSRF-attacker. Det som inte skyddas från är robotar som kan komma åt sidan först genom och sedan posta, här kan man dock ha en enklare fråga som "vad blir 1+1" för att bli av med en del robotar. 

**För projektet:**
Då användaren inte kan påverka applikationen på servern eller logga in finns ingen möjlighet till CSRF-attacker.

###Åtkomst av otillåtna resurser
Mappen där projektet ligger på servern ligger utanför dokumentrooten och går således inte att komm åt via en url, om det inte ligger i projektet egna public-mapp och är antingen CSS, JS eller JSON-filer.

Det finns inga URLer som är publika som skall kräva auktorisering för detta projekt. CMSet i sig har en adminpanel, men det är ingenting som det här pluginet utnyttjar.

##Prestanda
###Cache-header
Samtliga filer pluginet har kontroll över cachas på klienten med olika tider med hjälp av "max-age" beroende på vad som efterfrågas. Dynamiska filer såsom JSON-sökningar cachas inte av webbläsaren automtiskt. CSS-filer och Javascript cachas i ett dygn, vilket absolut bör utökas till ca: 3 månader. Detta görs när CMS'et inte längre är under utveckling.

###Scriptplacering
Allt javascript är placerat i filer och i slutet på dokumentet för att tillåta en progressiv rendering av sidan. 

###Stylesheetplacering
Alla CSS-regler är placerade i filer och i HEAD-taggen för att tillåta en progressiv rendering av sidan.

###Samla resurser i olika filer
Här är det ett medvetet val att inte samla alla JavaScript-filer i en och samma. Anledningen till detta är att CMS'et avgör vilka resurser som behövs för varje sidladdning och för att inte ladda in onödiga resurser är därför javascript och css uppdelat i olika filer. För projektets sida betyder det att filerna som är specifika för pluginet inte laddas in på 'Om Sidan'.

###Minifiering av resurser
Att hämta resurser är det som tar längst tid när man i normala fall laddar en sida, därför är samtliga resurser minifierade.
Detta görs genom att ta bort kommentarer och whitespaces i filerna med YUICompressor i PHPStorm.

###Komprimering
Samtliga resurser komprimmeras med GZIP. Undantaget för detta är bilder och (icke-existerande) PDF-filer.

###Content Delivery Network
Alla resurser och ramverk hostas på samma domän. Anledningen till detta är att Service Workern genererade en massa fel när jag försökte använda mig utav en CDN för jQuery och FontAwesome. Återstår att hitta en fungerande lösning på detta.




##Risker
###API
Det finns alltid en risk att ett API slutar fungera. I denna applikation bedömmer jag inte Google-APIerna ngon risk, utan det skulle vara om t.ex. ST1 ändrar formatet på sin tweet, eller att systembolaget gör förändringar i sitt API. Skulle något av detta infalla får jag strukturera om i de berörda klasserna. 

###Tekniskt
Då servern som applikationen hostas på är min privata server påverkas den av driftstörningar från min internetleverantör och ev. strömavbrott. Detta kan undvikas genom att hosta applikationen på en extern tjänst som har flera servrar utspridda över världen, dock är det ingenting som kommer att göras då det är en lite risk.

###Säkerhet
För applikationen skulle jag säga att det inte finns några säkerhetsluckor, men man kan inte lita på att det inte finns någon elak användare som hittar ett kryphål.

Den största risken är att någon tar sig in i adminpanelen då man därifrån kan styra allt, vilka plugin som ska vara aktiverade etc.

##Vidareutveckling efter deadline
###Integrering med border shop
Försöka få tillgång till utbud hos några border shopar och integrera detta i tjänsten för att användare ska slippa att manuellt knappa in priset på bordershop.

###Populära sökningar
Ge användaren tillgång till en lista på de mest populära varorna som andra har lagt till i sina kundkorgar.


