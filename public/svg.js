`<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
  <title>scroll demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="text/javascript" src="./scroll demo_files/d3.js.download"></sc`+`ript>
  <style id="compiled-css" type="text/css">
      #scrolly {
         position: relative;
         display: -webkit-box;
       display: -ms-flexbox;
       display: flex;
         background-color: #f3f3f3;
         padding: 1rem;
      }
      #scrolly > * {
         -webkit-box-flex: 1;
       -ms-flex: 1;
       flex: 1;
      }
      article {
         position: relative;
         padding: 0 1rem;
         max-width: 20rem;
      }
      figure {
         position: -webkit-sticky;
         position: sticky;
         width: 100%;
         margin: 0;
         -webkit-transform: translate3d(0, 0, 0);
         -moz-transform: translate3d(0, 0, 0);
         transform: translate3d(0, 0, 0);
         background-color: #d5b4ed;
      }
      figure p {
         text-align: center;
         padding: 1rem;
         position: absolute;
         top: 50%;
         left: 50%;
         -moz-transform: translate(-50%, -50%);
         -webkit-transform: translate(-50%, -50%);
         transform: translate(-50%, -50%);
         font-size: 8rem;
         font-weight: 900;
         color: #000000;
      }
      .step {
         margin: 0 auto 2rem auto;
         background-color: #3b3b3b;
         color: #fff;
      }
      .step:last-child {
         margin-bottom: 0;
      }
      .step.is-active {
         background-color: goldenrod;
         color: #3b3b3b;
      }
      .step p {
         text-align: center;
         padding: 1rem;
         font-size: 1.5rem;
      }

      .container {
      }
    
  </style>
</head>
<body>
    <main>
        <section id="scrolly">
         <article>
            <div class="step" data-step="1" data-scrollama-index="0" style="height: 1975px;">
               <p>STEP 1</p>
            </div>
            <div class="step" data-step="2" data-scrollama-index="1" style="height: 1975px;">
               <p>STEP 2</p>
            </div>
            <div class="step is-active" data-step="3" data-scrollama-index="2" style="height: 1975px;">
               <p>STEP 3</p>
            </div>
            <div class="step" data-step="4" data-scrollama-index="3" style="height: 1975px;">
               <p>STEP 4</p>
            </div>
         </article>
         <figure style="height: 564.5px; top: 282.25px;">
            <p>3</p>
            <svg width="800" height="800" viewBox="-400 -400 800 800" class="container">
              ${domString}
            </svg>
         </figure>
      </section>
  <section id="outro"></section>
</main>
<script src="./scroll demo_files/d3.min.js.download"></sc`+`ript>
<script src="./scroll demo_files/intersection-observer.js.download"></sc`+`ript>
<script src="./scroll demo_files/stickyfill.min.js.download"></sc`+`ript>
<script src="./scroll demo_files/scrollama.min.js.download"></sc`+`ript>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.8.0/gsap.min.js"></sc`+`ript>
    <script type="text/javascript">
// using d3 for convenience
var main = d3.select("main")
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");
var width = 200;
var height = 300;
var margin = { top: 40, bottom: 40, left: 70, right: 40 };


${functionString}

// initialize the scrollama
var scroller = scrollama();
      // generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 1.75);
  step.style("height", stepH + "px");
  var figureHeight = window.innerHeight / 2
  var figureMarginTop = (window.innerHeight - figureHeight) / 2
  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");
  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}
// scrollama event handlers
function handleStepEnter(response) {
  // response = { element, direction, index }
  // add color to current step only
  step.classed("is-active", function (d, i) {
    return i === response.index;
  })
  // update graphic based on step
  figure.select("p").text(response.index + 1);
  figure.call(activateFunctions[response.index])
}
function setupStickyfill() {
  d3.selectAll(".sticky").each(function () {
    Stickyfill.add(this);
  });
}
function init() {
  setupStickyfill();
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();
  // 2. setup the scroller passing options
  //       this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.setup({
    step: "#scrolly article .step",
    offset: 0.33,
    debug: true,
  })
    .onStepEnter(handleStepEnter)
  // setup resize event
  window.addEventListener("resize", handleResize);
}
// kick things off
init();
  </sc`+`ript><div id="scrollama__debug-offset--mtg1637828596155" class="scrollama__debug-offset" style="position: fixed; left: 0px; width: 100%; height: 0px; border-top: 2px dashed black; z-index: 9999; top: 372.57px;"><p style="font-size: 12px; font-family: monospace; color: black; margin: 0px; padding: 6px;">".step" trigger: <span>0.33</span></p></div>


</body></html>`