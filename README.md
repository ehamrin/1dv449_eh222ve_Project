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

###Hosting
Applikationen hostas på min egna Apache-server med PHP7. Det var ett taktiskt val att använda Service Workers då jag blev tvingad att använda mig utav HTTPS, vilket jag inte gjort tidigare. Jag använder mig utav Let's Encrypt som utfärdare av certifikat och det var intressant att installera detta på servern.

###Ramverk
Serverapplikationen bygger på mitt egna självinstallerande CMS som är under utveckling, vilket även är min motivation till varför jag använder det. Detta har inneburit att jag har behövt fixa en hel del saker med CMSet parallellt med projektet för att tillfredställa den funktionalitet som saknats. 

CMS'et i sig är modulbaserat där ALLT(adminpanel, pages, slider, inloggning, errorlog m.m.) mer eller mindre är ett plugin och sammanlänkningen sker med Hooks. Målet är att varje plugin skall hålla sig till en mapp som ska kunna självinstalleras. Det som finns i detta repositorie är innehållet i pluginmappen för AlcoholTrip.

##Säkerhet

###SQL-injections
All kommunikation mot databas sker via prepared statements och tillåter därför ingen otillåten injection.

###XSS
Då användaren inte kan påverka applikationen på servern finns ingen möjlighet till XSS-attacker.

###Cross Site Request Forgery
CMS'et i sig är för tillfället öppen för attacker med CSRF i adminpanelen, detta är ingenting som hunnits med att åtgärda under projektets gång utan kommer att fixas i ett senare skede med AntiRequestForgery-tokens.

**För projektet:**
Då användaren inte kan påverka applikationen på servern eller logga in finns ingen möjlighet till CSRF-attacker.

###Åtkomst av otillåtna resurser
Mappen där projektet ligger på servern ligger utanför dokumentrooten och går således inte att komm åt via en url, om det inte ligger i projektet egna public-mapp och är antingen CSS, JS eller JSON-filer.

Det finns inga URLer som är publika som skall kräva auktorisering för detta projekt. CMSet i sig har en adminpanel, men det är ingenting som det här pluginet utnyttjar.

##Prestanda
###Cache-header
Samtliga filer pluginet har kontroll över cachas på klienten med olika tider med hjälp av "max-age" beroende på vad som efterfrågas. Dynamiska filer såsom JSON-sökningar cachas inte av webbläsaren automtiskt. CSS-filer och Javascript cachas i ett dygn, vilket absolut bör utökas till ca: 3 månader. Detta görs när CMS'et inte längre är under utveckling.

###Scriptplacering
Allt javascript är placerade i filer och i slutet på dokumentet för att tillåta en progressiv rendering av sidan. 

###Stylesheetplacering
Alla CSS-regler är placerade i filer och i HEAD-taggen för att tillåta en progressiv rendering av sidan.

###Samla resurser i olika filer
Här är det ett medvetet val att inte samla alla JavaScript-filer i en och samma. Anledningen till detta är att CMS'et avgör vilka resurser som behövs för varje sidladdning och för att inte ladda in onödiga resurser är därför javascript och css uppdelat i olika filer. För projektets sida betyder det att filerna som är specifika för pluginet inte laddas in på 'Om Sidan'.

###Minifiering av resurser
Att hämta resurser är det som tar längst tid när man i normala fall laddar en sida, därför är samtliga resurser minifierade.
Detta görs genom att ta bort kommentarer och whitespaces i filerna.

###Komprimering
Samtliga resurser komprimmeras med GZIP. Undantaget för detta är bilder och (icke-existerande) PDF-filer.


##Vidareutveckling efter deadline
###Integrering med border shop
Försöka få tillgång till utbud hos några border shopar och integrera detta i tjänsten.


##Schematisk bild över applikationens beståndsdelar

![alt text](http://1dv449.erikhamrin.se/images/Alkoholrundan.png)

###Klassdiagram

![alt text](http://1dv449.erikhamrin.se/images/AlcoholRundanClassDiagram.png)

###Översikt av JavaScript objekt

* Init()
* Container
 * result
 * searchBar
 * cart
* AddEvents()
* Search
 * add
* Result
 * showDetails()
 * calculate()
* Gas
 * Price
     * isValid()
     * get
     * getPrice
     * getText
 * Consumption
     * liter
     * update()
     * get()
     * set()
     * draw()
* Distance
 * mile
 * update()
 * has()
* Locator
 * has()
 * update()
 * set()
 * get()
* Cart
 * total
 * borderPrice
 * get()
 * add()
 * draw()
 * remove()
 * empty()
