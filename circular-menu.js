// Demo by http://creative-punch.net

var items = document.querySelectorAll('.circle a');

for(var i = 0, l = items.length; i < l; i++) {
  items[i].style.left = (50 - 35*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
  items[i].style.top = (50 + 35*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
}

hammer.on('press', function(event) {
  if (!document.querySelector('.circle').classList.contains('open')) {
    document.querySelector('.circular-menu').style.top = (event.center.y-125)+"px";
    document.querySelector('.circular-menu').style.left = (event.center.x-125)+"px";
    document.querySelector('.circle').classList.add('open');
  } else {
    document.querySelector('.circle').classList.remove('open');
  }
  event.preventDefault()
})


var links = document.querySelectorAll('.circular-menu a');
for (i = 0; i < links.length; i++) {
  links[i].addEventListener("click",function(e) {
    e.preventDefault();
    document.querySelector('.circle').classList.remove('open');

    for (x = 0; x < links.length; x++) {
      links[x].classList.remove('active');
    }
    event.target.classList.add('active');
  });
}
