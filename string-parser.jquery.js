var Utils = {
    /**
     * Returns true if the value provided is a string or number (easier than two typeofs or $.inArray())
     *
     * @param   {*}         str     Value to determine if its a string or number
     * @returns {boolean}   Returns true if val is a string or number
     * @note    This could easily get added to the prototype of an existing object, and imported/used frequently
     */
    isStrOrNum: function( val ){
        if( val === undefined || val === null )
            return false
        
        // Get the type of the value, prioritize the constructor name first
        var valType = ( ( val.constructor !== undefined && val.constructor.name !== undefined ) 
            ? val.constructor.name 
            : typeof val )

       
        return $.inArray( valType.toLowerCase() [ 'string', 'number' ] ) !== -1
    },

    /**
     * Simple function to simplify a string, making it easy to match. For example, if the variable `case` 
     * was any of "Ignore Case", "IGNORE CASE", "ignore-CASE", you could just do Utils.simpleStr( case ) === 'ignorecase'
     * 
     * @param   {string}    str         String to simplify and return
     * @param   {boolean}   retainNums  If true, the numeric values wont be replaced
     * @return  {string}                Simplified version of the provided string
     * @note    This could easily get added to the prototype of an existing object, and imported/used frequently
     * @examples
     *      var ignCse = 'Ignore Case' // or any of: 'ignore_case', 'IGNORE-CASE', '   IGNORE !! CASE  '
     *      Utils.simpleStr( ignCse )                        // "ignorecase"
     *      Utils.simpleStr( 'Foo Bar !! 123' )              // "foobar"
     *      Utils.simpleStr( 'Foo Bar !! 123', true )        // "foobar123"
     *      Utils.simpleStr( ['FOO!','Bar?..','123'] )       // "foobar"
     *      Utils.simpleStr( ['FOO!','Bar?..','123'], true ) //"foobar123"
     */
    simpleStr: function( str, retainNums ) {
        try {
            str = str.toString()
        } catch (e) {
            throw "Utils.simpleStr failed to convert the parameter to a string - " + e
        }

        var ptrnSegs = ['\\W+']

        // Add numeric values to the regex to get removed, unless they were set to be preserved
        if (retainNums !== true) ptrnSegs.push('[0-9]+')

        //return str.replace( /(\W+|[0-9])/g, '' ).toLowerCase().trim()
        return str.replace(new RegExp('(' + ptrnSegs.join('|') + ')', 'g'), '').toLowerCase().trim()
    },

    /**
     * Get the type of a provided item. I made this as a wrapper around using typeof on some things (but it shouldnt 
     * be used everywhere), looking at the constructor names, etc etc
     * 
     * @param   {*}         thingy      The thingy to get the type of
     * @param   {boolean}   retObjName  If the thingy provided is an object instance of a class (for example), instead 
     *                                  of returning 'function', this returns the class name
     * @returns {string}    Returns the loser case name of the element type
     * @note    This could easily get added to the prototype of an existing object, and imported/used frequently
     */
    getType: function( thingy, retObjName ) {
        console.debug('_getType\n\tthingy:',thingy,'\n\tretObjName:',retObjName)
        if (thingy === null)
            return 'null'

        if (thingy === undefined)
            return 'undefined'

        if (typeof thingy.constructor !== 'function' || typeof thingy.constructor.name !== 'string')
            return 'unknown'

        var thingyType = thingy.constructor.name.toLower()

        if ( thingyType !== 'function' )
            return thingyType

        if ( retObjName ) {
            if ( typeof thingy.name === 'string' ){
                return thingy.name
            }

            if ( typeof thingy.prototype.constructor.name === 'string' ){
                return thingy.prototype.constructor.name
            }
        }


        if ( typeof thingy.name !== 'undefined' && retObjName === true ){
            return thingy.name
        }

        //thingy.prototype.constructor.name


        return thingy.constructor.name.toLowerCase()
    },

    /**
     *
     */
    getType:function() {

        var result

        if (arguments.length === 0)
            throw "No value(s) provided to test."

        if (arguments.length === 1) {

        }
        //
    },

    /**
     * Substitute replacements in a string. Similar to the console.(log|warn|error|debug), except it 
     * outputs it to a strong, and is a little more advanced
     *
     * @param   {string}                        str     String to parse/replace/return
     * @param   {string|number|array|object}    subs    Substitutions to make before returning the string
     * @param   {boolean}                       noTrim  If true, the str will NOT be trimmed (default is to trim it)
     * @todo Replace unmatched characters with optional defaults
     * @examples
     *      Utils.substVars('%he% %wo%', {he: 'Hello', wo: 'World'}) 
     *          // Hello World
     *      Utils.substVars('Both %1% and %2% went to %1%\'s house', ['jack','jill']) 
     *          // Both jack and jill went to jack's house
     *      Utils.substVars('When you\'re a dev, you deal with %s%, %s%, then sometimes.. more %s%', 'code') 
     *          // When you're a dev, you deal with code, code, then sometimes.. more code
     *
     */
    substVars: function( str, repls, noTrim ) {
        var cfg = {
            /**
             * Macro regex settings. These will be passed to the RegExp object, like so:
             *    someStr.match( RegExp.apply( this, [ cfg.macroRegex.pattern, cfg.macroRegex.flags ] ) )
             * Which should return an array similar to: ["{foo}","{foo:ab:cd:e:f:g}","{foo:a:b:c}", 
             *      "{baz:r:uc}","{namel:uf}","{namef:uf}","{highschool:uw}"]
             */
            macroRegex: {
                // Dont forget to cancel out any backslashes!
                //RegExp.apply( this, [ '\\{(([a-z]{1,10}|\\d+)+)(?:\\:([a-z]{1,2}|\\d*\\-?\\d+)*)*\\}', 'gm' ] )
                pattern: '\\{(([a-z]{1,10}|\\d+)+)(?:\\:([a-z]{1,2}|\\d*\\-?\\d+)*)*\\}',
                // Global, multiline
                flags: 'gm'
            }
        }
        
        /**
         * Macro Modifier Callbacks
         *
         * @namespace   MacroOptCallbacks
         * @property    {function}  *       All of the properties in this object are used for parsing and mutating 
         *                                  the word associated to a macro. Each, property needs to be a function, 
         *                                  accepting a single string argument, and returning the modified version 
         *                                  of said string. If there are any errors encountered, then exceptions 
         *                                  should be thrown, as they will be caught and processed
         * @note    The JsDoc comments here apply to all of the functions in this object
         * @todo    Create callbacks:
         *              
         */
        var MacroOptCallbacks = {
            /**
             * The full word Lower Case macro
             *
             * @summary     Simply modifies a string by changing it to upperCase()
             * @throws      Will throw a detailed exception if any error is encountered
             * @type        {function}          This is executed whenever the macro has the properties key 
             * @param       {string}    str     The string to interact with and modify
             * @return      {string}            The modified version of the string
             * @example     MacroOptCallbacks.uc( 'fooBar' ) === 'FOOBAR' // true
             */
            uc: function( str ){
                return str.toUpperCase()
            },
            
            /**
             * The full word Lower Case macro
             *
             * @summary     Simply modifies a string by changing it to upperCase()
             * @throws      Will throw a detailed exception if any error is encountered
             * @type        {function}          This is executed whenever the macro has the properties key 
             * @param       {string}    str     The string to interact with and modify
             * @return      {string}            The modified version of the string
             * @example     MacroOptCallbacks.lc( 'FooBar' ) === 'foobar' // true
             */
            lc: function( str ){
                return str.toLowerCase()
            },

            /**
             * Uppercase the first letter of the string
             *
             * @summary     Returns a string with the first word uppercased
             * @throws      Will throw a detailed exception if any error is encountered
             * @type        {function}          This is executed whenever the macro has the properties key 
             * @param       {string}    str     The string to interact with and modify
             * @return      {string}            The modified version of the string
             * @example     MacroOptCallbacks.lc( '' ) === '' // true
             */
            uf:function( str ){
                return str.substring( 0, 1 ).toUpperCase() + str.substring( 1 ).toLowerCase()
            },

            /**
             * ...
             *
             * @summary     Returns ...
             * @throws      Will throw a detailed exception if any error is encountered
             * @type        {function}          This is executed whenever the macro has the properties key 
             * @param       {string}    str     The string to interact with and modify
             * @return      {string}            The modified version of the string
             * @example     MacroOptCallbacks.lc( '' ) === '' // true
             */
            _:function( str ){
                return str.substring( 0, 1 ).toUpperCase() + str.substring( 1 ).toLowerCase()
            }

        }

        /**
         * Parse a string for any macros
         */
        var _parseStrPacros = function( _str, _repls, _default ){
            var _results = {}, 
                _macReplIndx = {},
                _macCfg, _rgxPtn, _macRgxMtchs, _macStr, thisRepl, _thsMacName

            if( ! _str ) throw "No string provided"
            if( ! _repls ) throw "No replacement data provided" 
            
            if( typeof _str !== 'string' )
                throw "Expected a parsable String variable type - received " 
                    + ( ! _str ? 'an empty or undefined value (typeof: '+typeof _str +')' : 'a variable type: ' + _str.constructor.name.toLowerCase())
            
            if( $.isPlainObject( _repls ) === false )
                throw "The replacements need to be an object"
            
            _rgxPtn = RegExp.apply( this, [ cfg.macroRegex.pattern, cfg.macroRegex.flags ] )

            // If theres a default set (and its a string or int/number), use it, otherwise, use blah for now..
            //_default = ( _default && $.inArray( _default..constructor.name.toLowerCase(), [ 'string', 'number' ] ) !== =1 ? _default : 'poop' )
            _default = Utils.isStrOrNum( _default ) ? _default : 'poop'

            try {
                _macRgxMtchs = _str.match( _rgxPtn )
            }
            catch( e ){
                console.error('Regex match failed against the string provided\n\tError:',e,'\n\tRegular Expression Pattern: ', _rgxPtn )
                return false
            }
            
            console.debug('_macRgxMtchs',_macRgxMtchs)
            
            if( ! _macRgxMtchs || ! _macRgxMtchs.length )
                return null
            
            // Iterate over the macro regex results..
            $.each( _macRgxMtchs, function( _mk, _mv ){
                console.debug('Macro #%s ():', _mk, _mv, _macCfg )

                // Remove the {} and split the macro by colons
                _macCfg = _mv.substring( 1, _mv.length-1 ).split( ':' )

                // Set the macro string, which is used to reference the data in the replacements obj
                _macStr = _macCfg.shift()
                
                // check that this value is a key in the replacements object, otherwise, default it
                //if( $.inArray( _macStr, Object.keys( _repls ) ) === -1 )
                //    _macStr = _default

                thisRepl = ( $.inArray( _macStr, Object.keys( _repls ) ) !== -1 ? _repls[ _macStr ] : _default )

                if( _macCfg && _macCfg.length > 0 ){
                    console.debug('Macro Details Defined (%s total)', _macCfg.length )

                    $.each( _macCfg, function( mCfgIdx, mCfg){
                        console.debug( '\n\tmCfgIdx:',mCfgIdx,'\n\tmCfg:',mCfg)
                    })
                }

                // Add this macro config to the macros replacement index object
                _macReplIndx[ _mv ] = {
                    idx: _mk,
                    macroStr: _mv,
                    replacementKey: _macStr,
                    macroProperties: _macCfg,
                    replacement: thisRepl
                }           
            })

            // Iterate over the processed macro data, and update the string
            $.each( _macReplIndx, function( mTxt, mCfg ){
                console.debug( 'Processing Macro Index #%s\n\tReplacement: %s -> %s', 
                    mCfg.idx, 
                    mCfg.macroStr,
                    mCfg.replacement )     

                str = str.replace( new RegExp( mCfg.macroStr, 'g' ), mCfg.replacement )

                var tmpStr

                // If there are macros specified
                if( $.isArray( mCfg.macroProperties ) === true && mCfg.macroProperties.length > 0 ){
                    $.each( mCfg.macroProperties, function( mKi, macroName ){
                        _thsMacName = macroName.toLowerCase()

                        // If this macro exists
                        if( $.inArray( _thsMacName, Object.keys( MacroOptCallbacks ) ) !== -1 ){


                            try {
                                // Execute the macros callback, storing it in a tmp var for validation
                                tmpStr = MacroOptCallbacks[ _thsMacName ]( str )

                                if( typeof tmpStr !== 'string' )
                                    throw 'The MacroOptCallbacks.'+ _thsMacName +'() function did not retur a string, it returned a typeof: ' + typeof tmpStr + '. Skipping this macros result.'
                                
                                str = tmpStr
                            }
                            catch( e ){
                                console.error( 'There was an error processing the macro MacroOptCallbacks.'+ _thsMacName +'() - ' + e.toString() )
                            }
                        }
                        else {
                            console.warn( 'It doesn\'t look like there was a callback found for the macro "%s", skipping to next macro..', _thsMacName  ) 
                        }
                    })
                }
            })

            console.debug( 'Returning processed result:',str)
            return str
        }
                
        
        // Make sure the string being parsed is a string
        if ( typeof str !== 'string' )
            throw 'Utils.substVars expected a string for the first argument - received a ' + str.constructor.name.toLowerCase()

        // Unless were specifically told not to trim, then trim it
        if ( noTrim !== true )
            str = str.trim()

        // If the ob
        if ( $.inArray( repls.constructor.name.toLowerCase(), ['string', 'number', 'object', 'array'] ) === -1) {
            console.warn('Expected a plain object, array, string or a number/integer for substitutions '
                +'handed to Utils.substVars - received a type of: %s', repls.constructor.name.toLowerCase() )
            return str
        }
        
        //console.log( '_parseStrPacros',_parseStrPacros( str, repls ) )

        /**
         * Internal function to do a find/replace with adding extra functionality (such as converting the case, 
         * reverse the word, etc)
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
         * @param   {string}            _s      String to parse/modify/return
         * @param   {string|number}     _f      String/number to find and replace
         * @param   {string|number}     _r      Replacement string/number to replace _f with
         * @param   {*}                 _rgx    Regex settings. By default (undefined), the only flag is 'g' 
         *                                      (global replacement). This argument accepts various input types:
         *                                      {boolean} Disable/Enable global replacements (enabled if undefined)
         *                                      {string} RegExp flags (EG: 'gi' for global and case-insensitive)
         *                                      {array} Array of RegExp flags (EG: ['g','i'] for same as previous)
         *                                      {undefned} Global Replacements
         *                                      {null} NO regex flags (so replaces fist (case-sensitive) match)
         *                                      {object} Object with boolean values for global (or g), and ignorecase 
         *                                      (or i) for regex settings
         * @return  {string}
         */
        var _processReplace_DISABLED = function(_s, _f, _r, _rgx) {
            var __rev = function(__s) {
                    return __s.split('').reverse().join('')
                },
                //_rgxType = _rgx.constructor.name.toLowerCase(),
                regexFlags = []


            if (typeof _rgx === 'undefined') {
                regexFlags.push('g')
            } else if (_rgx === null) {
                regexFlags = false // Not sure if this is needed
            } else if (typeof _rgx === 'string') {
                regexFlags = _rgx.toLowerCase().split('')
            } else if ($.isArray(_rgx)) {
                regexFlags = $.map(_rgx, function(n, i) {
                    return n.toLowerCase()
                })
            } else if ($.isPlainObject(_rgx)) {
                // Ugh... Now iterate over the object, trying to make it as idiot proof as possible, allowing the most 
                // random object keys as regex flags
                // g: global; 
                // i: ignore-case; 
                // u: unicode (treat pattern as a sequence of unicode code points); 
                // y: sticky (matches only from the index indicated by the lastIndex property of 
                //    this regular expression in the target string (and does not attempt to match from any later indexes).)
                $.each(function(_flg, _vl) {
                    // Check for global flags
                    if ($.inArray(_flg.toLowerCase(), ['g', 'global', 'all']) !== -1) {
                        if (_vl === true) regexFlags.push('g')

                        return
                    }

                    // Check for ignore-case flag
                    if ($.inArray(_flg.toLowerCase(), ['i', 'ignorecase', 'nocase', 'insensitive']) !== -1) {
                        if (_vl === true) regexFlags.push('i')

                        return
                    }

                    // Check for unicode flag
                    if ($.inArray(_flg.toLowerCase(), ['u', 'unicode', 'uni']) !== -1) {
                        if (_vl === true) regexFlags.push('u')

                        return
                    }

                    // Check for multi-line flag
                    if ($.inArray(_flg.toLowerCase(), ['m', 'multiline', 'multi']) !== -1) {
                        if (_vl === true) regexFlags.push('m')

                        return
                    }

                    // Check for sticky flag
                    if ($.inArray(_flg.toLowerCase(), ['y', 'sticky', 'stick']) !== -1) {
                        if (_vl === true) regexFlags.push('y')

                        return
                    }
                })
            }


            return _s
                .replace(new RegExp('%' + _f + '%', 'g'), _r)
                .replace(new RegExp('%u:' + _f + '%', 'g'), _r.toUpperCase())
                .replace(new RegExp('%l:' + _f + '%', 'g'), _r.toLowerCase())
                .replace(new RegExp('%r:' + _f + '%', 'g'), __rev(_r))
                .replace(new RegExp('%(ru|ur):' + _f + '%', 'g'), __rev(_r).toUpperCase())
                .replace(new RegExp('%(rl|lr):' + _f + '%', 'g'), __rev(_r).toUpperCase())

        }

        

        // If the substitutions is an object, then just use a key/val replacements
        if ( $.isPlainObject( repls ) ) {
            console.debug('BEFORE:',str)
            //str = _parseStrPacros( str, repls, 'zinggg' )
            str = _parseStrPacros( str, repls )
            console.debug('AFTER:',str)
            /*
            $.each( repls , function(find, replace) {
                str = _processReplace(str, find, replace)
            })
            */
        }

        // If its an array, replace by the array value key
        else if ($.isArray( repls )) {
            $.each( repls , function(key, replace) {
                //str = _processReplace(str, find, replace)
            })
        }

        // If its a string-able item, just replace all replacements
        else if ( Utils.isStrOrNum( repls ) === true ) {
            str = str.replace( new RegExp('%(s|n|i)%', 'gi'), subs.toString() )
        }

        // Otherwise, throw a fit
        else {
            throw "repls wasnt an error, string, array or object - it is an " + repls.constructor.name.toLowerCase()
        }

        return str
    }
}



/**
 * Demo/Example related functonality
 */
var demoCfgs = [
    {
        name: 'Basic',
        desc: '',
        demoSettings:{
            string: 'AAAA',
            replacements: '1111'
        }
    },
    {
        name: 'Advanced',
        desc: '',
        demoSettings:{
            string: 'BBBB',
            replacements: '2222'
        }
    }
]

$.each( demoCfgs, function( dIdx, dCfg ){
    $('#demo-links').append(
        $('<li/>', { 
            html: $('<a/>', {
                'class': 'demo-link',
                'href': '#',
                'text': '#'+dIdx+ ': ' +dCfg.name,
                'data-demo-id': dIdx
            }).prop('outerHTML')
        })
    )
})

$( document ).on( 'click', 'a.demo-link', function(e){
    e.preventDefault()

    var demoId = $(this).data('demo-id')
    console.log('loading demo ID %s', demoId)
})


/**
 *
 * @todo Perhaps when an example is submitted, allow users to expand a div/span that showed what was replaced to what, etc
 */
function addExample( objData ){

    var exampleCnt = $('#examples').find('span.tcc').length || 0

    $('#examples')
        .prepend($('<span/>', {
            id: 'test-case-' + ( exampleCnt+1 ),
            class: 'tcc common-width new-link'
        }).css('display', 'none'))
        //.find(".new-link:last").slideDown("fast").fadeIn()

    var $exampleSpan = $( '#test-case-' + ( exampleCnt+1 ) )

    $exampleSpan.slideDown()

    $exampleSpan.append(
        '<span class="tcn">Test #' + (exampleCnt+1) + '</span> ' 
        + '<span class="tcrvt">(Replacements value type: <span class="tcrvts">' + objData.repl.constructor.name + '</span>)</span>' 
        + ( ! objData.desc ? '' : ' ' + objData.desc) + '<br/>' 
        + '<span class="tcrp">Result:</span> <span class="tcr">' + Utils.substVars( objData.str, objData.repl ) + '</span>'
    )

    /*
    $('#examples')
        .prepend($('<span/>', {
            id: 'test-case-' + ( exampleCnt+1 ),
            class: 'tcc common-width'
        }))

    $('span#test-case-' + ( exampleCnt+1 ) )
        .append(
            '<span class="tcn">Test #' + (exampleCnt+1) + '</span> ' 
            + '<span class="tcrvt">(Replacements value type: <span class="tcrvts">' + objData.repl.constructor.name + '</span>)</span>' 
            + ( ! objData.desc ? '' : ' ' + objData.desc) + '<br/>' 
            + '<span class="tcrp">Result:</span> <span class="tcr">' + Utils.substVars( objData.str, objData.repl ) + '</span>'
        )
    */


    /*
    <div class="insert-links"></div>
    <button>Add</button>

    var i = 0;
    $("button").click(function() {
        if (i < 10) {
            $('.insert-links').append('<div style="display: none;" class="new-link" name="link[]">Count Number <strong>'+i+'</strong></div>');
            $('.insert-links').find(".new-link:last").slideDown("fast");
            i++;
        }
    });
    */
        
}


// Load default examples
if( typeof testCases !== 'undefined' && $.isArray( testCases ) && testCases.length ){
    $.each(testCases, function(k, testCase) {
        addExample( testCase )
    })
}

$('#submit').click(function(e){
    e.preventDefault()
    
    var $string       = $('#string'),
        $replacements = $('#replacements'),
        replJson      = null
        
    try{
        replJson = $.parseJSON( $replacements.val().trim() )
        $('#alerts').html('')
    }
    catch(e){
        console.error( 'Error parsing JSON string:', e)
        $('#alerts').html( 'There was an error parsing your JSON string: ' + e.toString() )
    }
    
    addExample({
        str: $string.val().trim(),
        repl: replJson,
        desc: null
    })
    console.log('replJson:',replJson)
        
})
/* // Done manually, it would look something like:
$('body')
    .append('<strong>Test #1</strong> <em>(Object as replacements)</em> Standard string replacement<br/>Result: ' 
        + Utils.substVars('%h% %w%', { h: 'Helo', w: 'World'} )  ).append('<hr/>') 
    .append('<strong>Test #2</strong> <em>(Object as replacements)</em> Changing case of replacement values<br/>Result: ' 
        + Utils.substVars('%u:h% %l:w%', { h: 'Helo', w: 'World'} )  ).append('<hr/>') 
    .append('<strong>Test #3</strong> <em>(Array as replacement)</em> <br/>Result: ' 
        + Utils.substVars('Both %1% and %2% went to %1%\'s house', ['jack','jill'])   ).append('<hr/>') 
*/
