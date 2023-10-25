function xy(key,phi,r,x,ciphertext){
    
    var n_squared = bigInt(key).pow(2);
    
    //muss 'richtig' herum sein! bzw in richtigen methoden
    var help_1 = bigInt(1n + key).modPow(bigInt(1), n_squared);
    var help_2 = bigInt(1n + key).modPow(bigInt(0), n_squared);
    
    var u_1 = divisionMod(ciphertext, help_1, n_squared);

    var u_2 = divisionMod(ciphertext, help_2, n_squared)
    ciphertext = bigInt(ciphertext)
    //M(key,u,r);
    var test = Prove(key,ciphertext, r)
    Verifie(key,ciphertext, test[0], test[1], test[2], test[3], test[4], test[5])
    //oneOutOfTwo(key, u_1, u_2, r);

};

function oneOutOfTwo(n, u_1, u_2, v){
    var first = Prover_1(n, u_2);
    var s = Verifier_1();
    var final = Prover_2(n,s,first[3],first[1], v)
    Verifier_2(n,first[0],first[2],final[0],final[1],first[3],first[4],s,u_1,u_2)
    
  };
  
  function Prover_1(n, u_2){
    var r = randomBigInt(2048);
    var n_squared = bigInt(n).pow("2");
    r = bigInt(r).mod(n_squared) 
  
    var conversation = honestM(n,u_2)
    var a_1 = bigInt(r).modPow(n,n_squared)
    var a_2 = conversation[0]
    var e_2 = conversation[1]
    var z_2 = conversation[2]
    return [a_1,r,a_2,e_2,z_2]
  };
  
  function Prover_2(n,s,e_2,r_1, v_1){
    var e_1 = bigInt(s).subtract(e_2).mod(bigInt(2).pow(2048))
    
    var n_squared = bigInt(n).pow("2");
  
    var help_1 = bigInt(v_1).modPow(e_1, n_squared)
    var help_2 = bigInt(r_1).mod(n_squared)
    var z_1 = bigInt(help_2).multiply(help_1).mod(n_squared)
  
    return[e_1,z_1]
  }

  function Verifier_1(){
    return randomBigInt(2048)
  }
  
  function Verifier_2(n,a_1,a_2,e_1,z_1,e_2,z_2,s,u_1,u_2){
    
    var n_squared = bigInt(n).pow("2");
    var s_test = bigInt(e_1).add(e_2).mod(bigInt(2).pow(2048))
    var z_1n = bigInt(z_1).modPow(n,n_squared)
    var z_2n = bigInt(z_2).modPow(n,n_squared)
    var z_1_help1 = bigInt(u_1).modPow(e_1,n_squared)
    var z_2_help1 = bigInt(u_2).modPow(e_2,n_squared)
    var z_1_help2 = bigInt(a_1).mod(n_squared)
    var z_2_help2 = bigInt(a_2).mod(n_squared)
    var z_1_test = bigInt(z_1_help2).multiply(z_1_help1).mod(n_squared)
    var z_2_test = bigInt(z_2_help2).multiply(z_2_help1).mod(n_squared) 
    
    console.log("s: " + (bigInt(s).compare(s_test)))
    console.log("z_1: " + (bigInt(z_1n).compare(z_1_test)))
    console.log("z_2: " + (bigInt(z_2n).compare(z_2_test)))
  
    if((bigInt(s).compare(s_test) == 0) && (bigInt(z_1n).compare(z_1_test) == 0) && 
    (bigInt(z_2n).compare(z_2_test) == 0)){
      console.log("1 or 2")
    }else{
      console.log("failed")
    }
  }
  
  /*
  function M(n,u,v){
   
      var m_1 = Prover_M_1(n);
  
      var e = Verifier_M_1(n);
      var z = Prover_M_2(m_1[1], v, e, n);
      Verifier_M_2(z,n,m_1[0],u,e);
      return [m_1[0],e,z]
  };
  
  function Prover_M_1(n){
  
  
     
      // n_squared = n**2
      var n_squared = bigInt(n).pow("2");
      // c2 = r**n mod n**2
      var r = randomBigInt(2048);
      r = bigInt(r).mod(n_squared) 
      var a = bigInt(r).modPow(n, n_squared);
      return [a,r];
  };
  
  function Verifier_M_1(n){
  
  
      var e = randomBigInt(2048)
      var n_squared = bigInt(n).pow("2");
      e = bigInt(e).mod(n_squared)
      return e;
  };
  
  function Prover_M_2(r,v,e,n){
  
  
  
  
      // n_squared = n**2
      var n_squared = bigInt(n).pow(2);
      // c = v**n mod n**2
      var c1 = bigInt(v).modPow(e, n_squared);
      var z = bigInt(r).mod(n_squared).multiply(c1).mod(n_squared);
      
      return z;
  };
  
  function Verifier_M_2(z,n,a,u,e){
  
    
  
      
      var n_squared = bigInt(n).pow(2);
      // c = v**n mod n**2
      var c1 = bigInt(u).modPow(e, n_squared);
  
      var z2 = bigInt(a).mod(n_squared).multiply(c1).mod(n_squared);
  
      var zn = bigInt(z).modPow(n, n_squared);
  
  
      if(bigInt(zn).compare(z2) == 0){
          console.log("accept");
      }else{
          console.log("reject");
      }
  };
  */  

  /*
function randomUnit(n)
{
  console.log("start")
  var i = 0;
  var n_squared = bigInt(n).pow(2);
  while(true){
    i += 1
    console.log("trial: " + i)
    var x = randomBigInt(2048)
    if(gcd(x,n_squared).compare(1) == 0){
      console.log("fund")
      return x;
      
    }
  }
}
*/