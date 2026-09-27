(function () {
        if ($(".body-container").length === 1) {
            var bodyContainer = $('.body-container')[0];
            var mybutton = document.createElement("button");          // Create a <button> node
            var textnode = document.createTextNode("Top");          // Create a text node
            mybutton.appendChild(textnode);                            // Append the text
            mybutton.setAttribute("id", "myBtn");                    // Set id
            mybutton.addEventListener("click", topFunction);        // Set onclick event handler
        
            bodyContainer.appendChild(mybutton);    // Append button element to main element

            // When the user scrolls down 20px from the top of the document, show the button
            //Both functions are used based on the responsive portion of the output
            bodyContainer.onscroll = function() {scrollFunction()};
            window.onscroll = function() {scrollFunctionx()};

            function scrollFunction() {
                if (bodyContainer.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                    mybutton.style.display = "block";
                } else {
                    mybutton.style.display = "none";
                }
            }
    
            function scrollFunctionx() {
                if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                    mybutton.style.display = "block";
                } else {
                    mybutton.style.display = "none";
                }
            }

            // When the user clicks on the button, scroll to the top of the document
            function topFunction() {
                $('html, body').animate({ scrollTop: 0 }, "smooth");
                $('html, documentElement').animate({ scrollTop: 0 }, "smooth");
                $('.body-container').animate({ scrollTop: 0 }, "smooth");
            }
        }
    })();