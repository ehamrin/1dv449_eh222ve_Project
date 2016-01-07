# Projektbeskrivning
**Erik Hamrin** (eh222ve)

1DV449 Linnéuniversitetet
##Sammanfattning
En responsiv webbsida där användaren kan välja artiklar ur Systembolagets sortiment och fylla i vad motsvarande skulle kosta på en border shop för att slutligen lägga till detta i en "kundvagn".

Användaren väljer vilken border shop man har tänkt handla hos och vad användarens milförbrukning är, och presenteras då med uppskattad kostnad för resan(inkl. varor) och vad motsvarande hade kostat på systembolaget.

##Tekniker
###APIer
Webbsidan kommer att utgå ifrån 3st APIer:

 * Systembolagets API (Sortiment)
	 * Detta kan behöva bytas ut mot [systemetapi.se](http://systemetapi.se/). Jag har testat mot systembolagets egna api, men då hela sortimentet hämtas som en stor XML får min server timeout 95% av anropen då det är en stor fil. systemetapi.se mellanlagrar Systembolagets egna XML och applikationer kan ställa specifika frågor mot den med JSON-svar.
 * [@St1Sverige](https://twitter.com/st1sverige)'s twitterfeed (Aktuellt bensinpris)
 * Google Maps (Platstjänst samt avståndsberäkning)

###Offline
Då många delar av applikationen skulle kunna fungera offline finns stor möjlighet att utveckla en offline-applikation. 

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
