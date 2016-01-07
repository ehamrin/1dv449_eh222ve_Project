<?php


namespace plugin\AlcoholTrip\model;


class TwitterAPI
{
    public function getGasPrice(){
        try{
            $TweetPHP = new \TweetPHP(array(
                'consumer_key'              => \Settings::Twitter_ConsumerKey,
                'consumer_secret'           => \Settings::Twitter_ConsumerSecret,
                'access_token'              => \Settings::Twitter_AccessToken,
                'access_token_secret'       => \Settings::Twitter_AccessTokenSecret,
                'twitter_screen_name'       => 'St1Sverige',
                'cache_dir'                 => __DIR__ . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR,
                'cache_time'                => 60*60*24 //1 day
            ));

            $tweet_array = $TweetPHP->get_tweet_array();

            $gasPrice = new GasPrice($tweet_array);

            return $gasPrice;

        }catch(\Exception $e){
            return false;
        }
    }
}