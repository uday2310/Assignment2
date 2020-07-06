public with sharing class LwcAccountSearch {
    
    @auraEnabled(cacheable=true)
    public static list<Account> searchAcc(String accountType){
        if(accountType != '' && accountType !=null){
            return [select Id, Name,Website,AccountNumber,Industry,Rating,Type from account where type = :accountType];
        }
        else
            return [select Id, Name,Website,AccountNumber,Industry,Rating,Type from account];
    }
}