# jQuery Ersatz
### Summary
It's basically an awesome and easy way to allow users to add veriables and even "macros" 

### Preview
I actually coded this entire thing on JSFiddle, I didnt really expect it to get anywhere near the size that it got. So check out the [JSFiddle](https://jsfiddle.net/jLinux/0n65sgh2/) instance.

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

### Macro Operators
Macros are the `{things:like:this}`. The details are retrieved by splitting the macro by a colon (which may be configurable later..). The **first** element in the split result is the key, which is used to match for the alue to be replaced. The rest are the **Macro Operators**. 

Here are a couple I have in mind already to create rather soon:

 - **uc**: Upper Case entire word
 - **lc**: Lower Case entie word
 - **re**: Reverse the word (EG: `foobar` -> `raboof`)
 - **ra**: Randomize the order of the characers in the word
 - **0-3**: Only show the characters in locations 0 through 3

And there wll be more to come!!
