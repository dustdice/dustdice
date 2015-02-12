$.fn.textWidth = function () {
        var $body = $('body');
        var $this =  $(this);
        var $text = $this.text();
        if($text=='') $text = $this.val();
        var calc = '<div style="clear:both;display:block;visibility:hidden;"><span style="width:inherit;margin:0;font-family:'  + $this.css('font-family') + ';font-size:'  + $this.css('font-size') + ';font-weight:' + $this.css('font-weight') + '">' + $text + '</span></div>';
        $body.append(calc);
        var width = $body.find('span:last').width();
        $body.find('span:last').parent().remove();




        var fakeInput = document.createElement('<div style="clear:both;display:block;visibility:hidden;"><span style="width:inherit;margin:0;font-family:'  + $this.css('font-family') + ';font-size:'  + $this.css('font-size') + ';font-weight:' + $this.css('font-weight') + '">' + $text + '</span></div>');
        var parser = new DOMParser();
        var doc = parser.parseFromString(fakeInput, "application/xml");

        //var style = window.getComputedStyle(fakeInput, null);
        console.log(doc);

        return width;
    };
