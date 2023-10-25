<template>
  <q-page class="q-ma-md">
    <q-btn size="lg" color="primary" @click="benchmark">Benchmark</q-btn>
    {{ status }}
    <p>
      {{ text }}
      <br />
      {{ time_keygen }}
      <br />
      {{ time_enc }}
      <br />
      {{ time_dec }}
    </p>
    <q-btn size="lg" color="primary" @click="xy">xy</q-btn>
  </q-page>
</template>

<script>
export default {
  name: "PageIndex",

  data: function() {
    return {
      config: {},
      status: "Ready",
      text: "0",
      time_keygen: 0,
      time_enc: 0,
      time_dec: 0
    };
  },
  methods: {
    xy() {
      const si = require("systeminformation");

      si.cpu()
        .then(data => {
          console.log("CPU Information:");
          console.log("- manufucturer: " + data.manufacturer);
          console.log("- brand: " + data.brand);
          console.log("- speed: " + data.speed);
          console.log("- cores: " + data.cores);
          console.log("- physical cores: " + data.physicalCores);
          console.log("...");
        })
        .catch(error => console.error(error));

      console.log("TEst");
    },

    async benchmark() {
      console.log(require("os").cpus().length);
      console.log("-----------------------");
      this.status = "Busy";
      var bits = 1024;
      this.text = 0;
      var t0 = performance.now();

      // var n = BigInt(
      //   "383131410238975227447235255322627836529657110380050006923363659520762082359170101290767822558689542927404571684679601609495179861773899013220759508712288175615641131067570794545643516578822771893929506932818292991128837630752933525723273249506838346006876583627049778836933475045269651591824278782927000663823440890265347922482327991956429973751509252923727084773568264718116731364228045742646062607991537796504183468403035316356424432610285302793008943761375932823939879014392991714988063294324252839201160003990736110806462292744200403624262077429561249514640064825925018188990570659012239491990873571352821854030339336407059338874547635183840000865137558805790643536226195765200174111467642458509848061316936369365444788196718813368940259660740716165936555572588434935677298028571832534891718827789297439153192050814417767604064239891901428978408297015989587105048112449295084732974523122099533215862553611735008413889398301487625883211632846359219545234546371362260799061704431553621478091169724633322883836274133227382510234064183372441934811191310402654420264162610020122547775538514761122168305111146540529930350919331238573645635587376848032342368513014556251374360061886431607381160760745028033603994129919073704127757590361"
      // );

      // var phi = BigInt(
      //   "383131410238975227447235255322627836529657110380050006923363659520762082359170101290767822558689542927404571684679601609495179861773899013220759508712288175615641131067570794545643516578822771893929506932818292991128837630752933525723273249506838346006876583627049778836933475045269651591824278782927000663823440890265347922482327991956429973751509252923727084773568264718116731364228045742646062607991537796504183468403035316356424432610285302793008943761375932823939879014392991714988063294324252839201160003990736110806462292744200403624262077429561249514640064825925018188990570659012239491990873571352821854030300039230581329547652647932389370809811092739015131183543226834520629620218110714100932167839288608323574698992835696853746328223606196087711451648387194996264932704093290156798699292534810574298203961024808608916193943620897819717095023563718834805376953803347294821240056291190971937083861675295592621223216670721965459720017451589611023969460063072766332492024127375210804247462260593553499950632566951845849308790361181703175545008388143857977267581636289260934770717424813667729599613127814530176304219697140808512067389301577038169817453055184634995522424791151265946644829260689748321884000157912222460694070324"
      // );

      // this.getRandomPaillier(n, bits);
      // -------------------------
      this.status = "Computing primes";
      console.log("Computing Primes");
      var t0_1 = performance.now();

      // Generate primes p and q
      const bigintCryptoUtils = require("bigint-crypto-utils");
      var p, q;
      await bigintCryptoUtils.prime(bits).then(value => {
        p = value;
      });
      await bigintCryptoUtils.prime(bits).then(value => {
        q = value;
      });

      var n = p * q;
      var phi = (p - 1n) * (q - 1n);
      var t1_1 = performance.now() - t0_1;
      this.time_keygen = performance.now() - t0_1;
      console.log(t1_1 + "ms");

      // -------------------------

      // Random Plaintext
      const random = require("random-bigint");
      var x = random(2) + 1n;
      console.log("Plaintext: " + x);

      // encrypt plaintext
      var c = this.paillierEncrypt(n, bits, x);

      // decrypt ciphertext
      var c_de = this.paillierDecrypt(n, bits, c, phi);
      console.log("Decrypted Ciphertext: " + c_de);

      var t1 = performance.now() - t0;
      console.log(t1 + "ms");
      this.text = t1 + " ms";
      this.status = "Ready";
    },
    /**
     * Paillier Encrypt
     */
    paillierEncrypt(n, bits, x) {
      this.status = "Encrypting";
      console.log("Encrypting");
      var t0 = performance.now();
      var bigInt = require("big-integer");

      // Random r
      var r = this.getRandomPaillier(n, bits);

      // n**2
      var n_squared = bigInt(n).pow(2);

      // c1 = (1+n)**x mod n**2
      var c1 = bigInt(1n + n).modPow(x, n_squared);

      // c2 = r**n mod n**2
      var c2 = bigInt(r).modPow(n, n_squared);

      // t00 = performance.now();
      var c = c1.multiply(c2);

      // t00 = performance.now();
      c = c.mod(n_squared);

      c = BigInt(c.toString());

      var t1 = performance.now() - t0;
      console.log(t1 + "ms");
      this.time_enc = t1;
      return c;
    },
    paillierEncryptDebug(n, bits, x) {
      this.status = "Encrypting";
      console.log("Encrypting");
      var t0 = performance.now();
      var bigInt = require("big-integer");

      // Random r
      var r = 1n;
      r = this.getRandomPaillier(n, bits);
      // n**2
      var t00 = performance.now();
      var n_squared = bigInt(n).pow(2);
      var t11 = performance.now() - t00;
      console.log("n^2: " + t11);

      // c1 = (1+n)**x mod n**2
      t00 = performance.now();
      var c1 = bigInt(1n + n).modPow(x, n_squared);
      t11 = performance.now() - t00;
      console.log("(1+n)^x mod n^2: " + t11);

      // c2 = r**n mod n**2
      t00 = performance.now();
      var c2 = bigInt(r).modPow(n, n_squared);
      t11 = performance.now() - t00;
      console.log("r^n mod n^2: " + t11);

      t00 = performance.now();
      var c = c1.multiply(c2);
      t11 = performance.now() - t00;
      console.log("c1 * c2: " + t11);

      t00 = performance.now();
      c = c.mod(n_squared);
      t11 = performance.now() - t00;
      console.log("c mod n^2: " + t11);

      c = BigInt(c.toString());

      var t1 = performance.now() - t0;
      console.log(t1 + "ms");
      this.time_enc = t1;
      return c;
    },

    /**
     * Funktioniert nicht gut. Idee: Rechnungen aufsplitten
     *
     * @deprecated
     */
    recModPow(a, b, c, count) {
      var bigInt = require("big-integer");
      var res = 0n;
      var b_half1 = b / 2n;
      var b_half2 = b - b_half1;
      var part1, part2;

      if (b_half1 < 100000000 || count <= 0) {
        //console.log("### Computing ###");
        var t00 = performance.now();
        part1 = bigInt(a).modPow(b_half1, c);
        part2 = bigInt(a).modPow(b_half2, c);
        var t11 = performance.now() - t00;
        //console.log("Time for 2 modPow: " + t11);
        res = part1.multiply(part2);
        res = res.mod(c);
        console.log("return");
        return res;
      } else {
        //console.log("### rekursion ###");
        part1 = this.recModPow(a, b_half1, c, count - 1);
        part2 = this.recModPow(a, b_half2, c, count - 1);
        res = part1.multiply(part2);
        res = res.mod(c);
        return res;
      }
    },
    /**
     * Paillier Decrypt
     */
    paillierDecrypt(n, bits, y, phi) {
      this.status = "Decrypting";
      console.log("Decrypting");
      var t0 = performance.now();
      var bigInt = require("big-integer");

      // n**2
      // var t00 = performance.now();
      var n_squared = bigInt(n).pow(2);
      // var t11 = performance.now() - t00;
      // console.log("n^2: " + t11);

      // x = (y**phi mod n**2) - 1
      // t00 = performance.now();
      var x = bigInt(y)
        .modPow(phi, n_squared)
        .subtract(1);
      // t11 = performance.now() - t00;
      // console.log("y^phi mod n^2: " + t11);

      // x = x /n
      // t00 = performance.now();
      x = bigInt(x).divide(n);
      // t11 = performance.now() - t00;
      // console.log("x/n: " + t11);

      // x = x * phi**-1
      // t00 = performance.now();
      x = bigInt(x).multiply(bigInt(phi).modInv(n));
      // t11 = performance.now() - t00;
      // console.log("x*phi^-1: " + t11);

      // x = x mod n
      // t00 = performance.now();
      x = bigInt(x).mod(n);
      // t11 = performance.now() - t00;
      // console.log("x mod n: " + t11);

      x = BigInt(x.toString());

      var t1 = performance.now() - t0;
      this.time_dec = t1;
      console.log(t1 + "ms");
      return x;
    },
    /**
     * Get a random number for Paillier. I.e. in Zn*
     */
    getRandomPaillier(n, bits) {
      const random = require("random-bigint");
      var bigInt = require("big-integer");
      var ran = 0n;
      var gcd = 0;
      var counter = 0;
      do {
        ran = random(this.getRandomInt(0, bits));
        gcd = this.gcd(n, ran);
        counter++;
      } while (gcd != 1);
      return ran;
    },
    gcd(a, b) {
      var r = 0n;
      while (b != 0) {
        r = a % b;
        a = b;
        b = r;
      }
      return a;
    },
    /**
     * Random int between min and max
     */
    getRandomInt(min, max) {
      return (Math.random() * (max - min) + min) | 0;
    },
    /**
     * Inverse of a in Zn*
     *
     * Not used anymore
     */
    modInverse(a, m) {
      var m0 = m;
      var y = 0n,
        x = 1n;

      if (m == 1) return 0;

      while (a > 1) {
        // q is quotient
        var q = a / m;
        var t = m;

        // m is remainder now, process same as
        // Euclid's algo
        (m = a % m), (a = t);
        t = y;

        // Update y and x
        y = x - q * y;
        x = t;
      }

      // Make x positive
      if (x < 0) x += m0;

      return x;
    }
  }
};
</script>
