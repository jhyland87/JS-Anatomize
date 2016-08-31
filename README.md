# jQuery Ersatz
### Summary
It's basically an awesome and easy way to allow users to add veriables and even "macros" 

### Examples
```javascript
Utils.substVars('{hi} {earth}', { hi: 'hello', earth: 'world'} )
// Result: 'hello world'

Utils.substVars('{hi:lc} {earth:hc}', { hi: 'Hello', earth: 'World'} ) // Notice the :uc (to force upper case), and :lc (for lower) 
// Result: 'hello WORLD' 

Utils.substVars('{hi:uf} %earth:uf}', { hi: 'hello', earth: 'world'} ) // Notice the :uf, well thats uppercase (the FIRST letter), and leave the rest alone
// Result: 'Hello World' 

// Lets say you want to be sure ONLY the first letter is caps, the rest is lower, just multiple settings in the macros, in order\
Utils.substVars('{hi:lc:uf} {earth:lc:uf}', { hi: 'hElLo', earth: 'wOrLd'} ) 
// Result: 'Hello World' 

// Or get more fancy, and just get parts of the strings
Utils.substVars('Hello, my name is {fnam:lc:uf} {lname:lc:uf}. My email is {fnam:lc:0}.{lname:lc:1-}@some-company.com.', { fnam: 'john', lname: 'doe' } ) 
// Result: Hello, my name is John Doe. My email is j.doe@some-company.come.
```

### More To Come!
I just got started on this
