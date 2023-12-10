# Encryption on the internet
## Why encryption
People use encryption because every packet you send from your machine travels over like a dozen routers and switches on the way to its destination, and if your stuff weren't encrypted it would be easy for the public wi-fi you're on to steal your credit card number etc. or for some hacker to crack open a junction box for a cell tower out in the woods.

So there's something called a Diffie Hellman key exchange, I don't really know where that fits in, but it's possible for two people who have never met to establish a shared encryption key over a plaintext channel
without either side directly saying what its key is. That sounds like it's all you need to go from a plaintext channel to an ecrypted one, but there's an attack called "Man in the middle".

## MitM attacks
MitM attacks happen when the evil router ("Eve") on the way from the client to the server says, actually, I got this, I'm the server. And then instead of passing on the packets like it should, Eve does the server's part of the Diffie Hellman key exchange. To prevent the client from realizing something's up, Eve will also send copies of the client's packets to the intended server, except Eve will replace the client's half of the DH key exchange with its own.

And from then on, Eve will dynamically decrypt packets between the client and the server, read them, and then re-encrypt them with its own key so both the client and the server think they have a secure channel.

## Security certificates
A solution to this is security certificates.

Every operating system (or maybe every web browser; idk) comes with some "root certificates" for the internet baked in. The root certificates are held by companies e.g. Symantec/Verisign, who for a fee give you a certificate that says,

> The public key for suchandsuch.com is soandso.

The idea is that, if you are asking for gmail.com, the only person with a certificate signed by a CA labeled as for gmail.com should be google itself. Eve can sign its own certificate for gmail.com, but (in theory) it's impossible to forge a signature from one of the CA's without having access to the CA's private key. The certficates avoid the cleartext channel problem entirely since they come with your OS.

And if Eve refuses to send the certificate along, or modifies it, that's detectable, and the client can just refuse to connect.

## ACME challenge
So how do servers get their certificates?

The certificate authority needs some way of verifying that you and only you actually own the domain. For Let's Encrypt, they do that with an "ACME" challenge; idk how it works.

Vaguely, you have a client that connects to acme-v02.api.letsencrypt.org, and Let's Encrypt tells the client to host some responses at specified locations on yourdomain.com, and then Let's Encrypt verifies that those files are actually accessible via that domain. There's specific timing requirements and key stuff to prevent MitM stuff that's really beyond me.

Anyway, you run the acme_tiny.py script that does the challenge, and it spits out a certificate which you give to your server which somehow knows how to pass that along to the client and make everything work. \
  -- Mark

P.S. I haven't (as of 2023-12-10) verified acme_tiny.py. It's on the list.

## Concrete advice
To get the signed chain:

```
cd /etc/nginx/tls/
python acme_tiny.py --account-key account.key --csr domain.csr --acme-dir /var/www/challenges/ > signed-chain.crt
```

If account.key and domain.csr have gotten wiped somehow, regenerate them like so:
```
cd /etc/nginx/tls/
openssl genrsa 4096 > domain.key
openssl genrsa 4096 > account.key
openssl req -new -sha256 -key domain.key -sub "/CN=fa.mpeschel10.com" > domain.csr
```
