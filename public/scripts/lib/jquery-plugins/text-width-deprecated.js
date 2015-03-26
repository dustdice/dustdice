$.fn.textWidth = function () {
        var $body = $('body');
        var $this =  $(this);
        var $text = $this.text();
        if($text=='') $text = $this.val();
        var calc = '<div style="clear:both;display:block;visibility:hidden;"><span style="width:inherit;margin:0;font-family:'  + $this.css('font-family') + ';font-size:'  + $this.css('font-size') + ';font-weight:' + $this.css('font-weight') + '">' + $text + '</span></div>';
        $body.append(calc);
        var width = $body.find('span:last').width();
        $body.find('span:last').parent().remove();
        return width;

        //Failed try to do it without appending elements to the DOM
        //var fakeInputText = '<div style="clear:both;display:block;"><span style="width:inherit;margin:0;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:22px;font-weight:400"></span></div>';
        //var parser = new DOMParser();
        //var doc = parser.parseFromString(fakeInputText, "text/html");
        //var style = document.defaultView.getComputedStyle(doc.getElementsByTagName("div")[0]); //doc.querySelector("span")
    };