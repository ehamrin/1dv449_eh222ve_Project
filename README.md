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

Till exempel:

* Cachning av rutter till populära border-shopar med avstånd, samt de användaren sökt på tidigare.
* Cachning av aktuellt bensinpris
* Cachning av delar av Systembolagets sortiment (är tveksam till om man ska försöka cachea hela, det kommer att testas, annars mest populära/det man sökt på tidigare)

De övriga delarna är en beräkning/sammanställning av ovannämda delar och bör således fungera offline.

####Offline-tekniker
Den teknik som primärt kommer att underökas för offline-bruk är [Service Workers](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)

###Hosting
Webbsidan kommer byggas på en Apache-server med PHP7 som serverspråk. Webbsidan kommer att köras på HTTPS-protokollet.

##Problematik
1. ST1 slutar publicera bensinpris
	* **Lösning:** Leta efter någon annan tjänst som publicerar bensinpriser, men se till att det senaste från Twitter alltid är cacheat på servern.
2. Man vill inte dela med sig av sin plats.
	* **Lösning:** Ge användaren förslag på förbestämda platser i Sverige(med lagom spridning) för att kunna ge en sådan bra upplevelse som möjligt.

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
