<?php
namespace plugin\AlcoholTrip\model;

class AlcoholTripModel
{
    private $conn;
    private static $cache_life = 7; //days

    public function __construct(){
        $this->conn = \Database::GetConnection();
    }

    public function GetProducts(){
        return $this->loadFromDb() ?? $this->getFromAPI('https://www.systembolaget.se/api/assortment/products/xml');
    }

    private function loadFromDb(){
        $time = date('Y-m-d H:i:s', strtotime('-' . self::$cache_life  . ' days', time()));

        $stmt = $this->conn->prepare("SELECT * FROM product WHERE created > '$time' ");
        $stmt->execute();

        if($stmt->rowCount()){
            return $stmt->fetchAll();
        }else {
            return null;
        }
    }

    private function getFromAPI($url){
        try{
            $content = $this->loadFromURL($url);
            $this->insertProductsToDatabase($content);
            return $this->loadFromDb();

        }catch(\Throwable $e){
            throw $e;
        }
    }

    private function loadFromURL($url){
        $url = "https://www.systembolaget.se/api/assortment/products/xml";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        $data = curl_exec($ch);
        curl_close($ch);

        $xml = simplexml_load_string($data);

        $rows = array();
        foreach($xml->artikel as $product){
            $rows[] = array(
                $product->Artikelid[0],
                $product->Namn[0],
                $product->Prisinklmoms[0],
                $product->Forpackning[0],
                $product->Alkoholhalt[0],
                $product->Volymiml[0]
            );
        }

        return $rows;
    }

    private function insertProductsToDatabase($content){

        $this->conn->beginTransaction();
        try{
            $this->conn->exec("TRUNCATE TABLE `product`");

            //Split query into chunks of 200
            foreach(array_chunk($content, 200) as $chunk){
                $stmt = array();
                $params = array();

                //Add proper sql to array foreach row
                foreach($chunk as $row){
                    $stmt[] = "(?,?,?,?,?,?)";

                    //Add params to single array
                    foreach($row as $param){
                        $params[] = $param;

                    }
                }
                $sql = "INSERT INTO product (id, name, price, container, alcohol, volume) VALUES " . implode(',', $stmt);
                $stmt = $this->conn->prepare($sql);
                $stmt->execute($params);
            }

            $this->conn->commit();

        }catch (\Exception $e){
            $this->conn->rollBack();
            throw $e;
        }


    }

    public function Install(){
        $this->conn->exec('
          CREATE TABLE IF NOT EXISTS `product` (
              `id` int(11) NOT NULL,
              `name` varchar(200) COLLATE utf8_swedish_ci NOT NULL,
              `price` varchar(20) COLLATE utf8_swedish_ci NOT NULL,
              `container` varchar(50) COLLATE utf8_swedish_ci NOT NULL,
              `alcohol` varchar(20) COLLATE utf8_swedish_ci NOT NULL,
              `volume` varchar(20) COLLATE utf8_swedish_ci NOT NULL,
              `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;


         ALTER TABLE `product`
            ADD PRIMARY KEY (`id`);
        ');
    }

    public function Uninstall(){
        $this->conn->exec('
          DROP TABLE IF EXISTS `product`
        ');
    }

    public function IsInstalled(){

        try {
            $result = $this->conn->query("SELECT 1 FROM product LIMIT 1");

        } catch (\Exception $e) {
            return FALSE;
        }

        // Result is either boolean FALSE (no table found) or PDOStatement Object (table found)
        return $result !== FALSE;
    }

}