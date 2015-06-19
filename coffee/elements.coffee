
ElementNames = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.toUpperCase().split(' ');

attributeClass = (key, value) -> if value then value.replace /\*/g, x.key2class key else x.key2class key
   
addAttribute = (o, attr, value, seperator=' ') ->
   x.object o, attr, if o[attr] and o[attr].length > 0 then o[attr] + seperator + value else value

attributes = (obj) ->
   x.reduceKeys obj, {}, (o, k) -> switch
      when x.check 'class', k    then addAttribute o, 'class', attributeClass k, x.parseValue obj[k]
      when k is 'class' then addAttribute o, 'class', x.parseValue obj[k] 
      else x.object o, x.dasherize(k), x.parseValue obj[k]

if Meteor.isClient
	ElementNames.forEach (a) -> window[a] = (obj, str) ->
		obj = attributes obj
		if str then HTML.toHTML HTML[a] obj, str else HTML.toHTML HTML[a] obj
