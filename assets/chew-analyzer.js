/**
 * Prime Pet Food - AI Chew Duration Analyzer
 * V1: Rules-based scoring engine
 * @version 1.0.0
 */
(function(){
'use strict';

var BREEDS={
'golden-retriever':{name:'Golden Retriever',mod:1.0,cat:'large',jaw:'moderate'},
'labrador-retriever':{name:'Labrador Retriever',mod:0.85,cat:'large',jaw:'strong'},
'german-shepherd':{name:'German Shepherd',mod:0.8,cat:'large',jaw:'strong'},
'french-bulldog':{name:'French Bulldog',mod:1.3,cat:'small',jaw:'moderate'},
'bulldog':{name:'Bulldog',mod:0.75,cat:'medium',jaw:'very-strong'},
'poodle':{name:'Poodle',mod:1.4,cat:'medium',jaw:'gentle'},
'beagle':{name:'Beagle',mod:1.1,cat:'medium',jaw:'moderate'},
'rottweiler':{name:'Rottweiler',mod:0.65,cat:'large',jaw:'very-strong'},
'yorkshire-terrier':{name:'Yorkshire Terrier',mod:1.8,cat:'tiny',jaw:'gentle'},
'boxer':{name:'Boxer',mod:0.8,cat:'large',jaw:'strong'},
'dachshund':{name:'Dachshund',mod:1.5,cat:'small',jaw:'moderate'},
'siberian-husky':{name:'Siberian Husky',mod:0.85,cat:'large',jaw:'strong'},
'great-dane':{name:'Great Dane',mod:0.7,cat:'giant',jaw:'strong'},
'doberman':{name:'Doberman Pinscher',mod:0.75,cat:'large',jaw:'strong'},
'australian-shepherd':{name:'Australian Shepherd',mod:1.0,cat:'medium',jaw:'moderate'},
'cavalier-king-charles':{name:'Cavalier King Charles',mod:1.6,cat:'small',jaw:'gentle'},
'shih-tzu':{name:'Shih Tzu',mod:1.7,cat:'small',jaw:'gentle'},
'boston-terrier':{name:'Boston Terrier',mod:1.2,cat:'small',jaw:'moderate'},
'pomeranian':{name:'Pomeranian',mod:1.9,cat:'tiny',jaw:'gentle'},
'havanese':{name:'Havanese',mod:1.7,cat:'small',jaw:'gentle'},
'shetland-sheepdog':{name:'Shetland Sheepdog',mod:1.3,cat:'medium',jaw:'gentle'},
'bernese-mountain-dog':{name:'Bernese Mountain Dog',mod:0.85,cat:'giant',jaw:'moderate'},
'cocker-spaniel':{name:'Cocker Spaniel',mod:1.2,cat:'medium',jaw:'moderate'},
'miniature-schnauzer':{name:'Miniature Schnauzer',mod:1.4,cat:'small',jaw:'moderate'},
'chihuahua':{name:'Chihuahua',mod:2.0,cat:'tiny',jaw:'gentle'},
'border-collie':{name:'Border Collie',mod:1.1,cat:'medium',jaw:'moderate'},
'pit-bull':{name:'Pit Bull',mod:0.6,cat:'medium',jaw:'very-strong'},
'maltese':{name:'Maltese',mod:1.8,cat:'tiny',jaw:'gentle'},
'corgi':{name:'Corgi',mod:1.2,cat:'medium',jaw:'moderate'},
'jack-russell':{name:'Jack Russell Terrier',mod:1.1,cat:'small',jaw:'strong'},
'mastiff':{name:'Mastiff',mod:0.55,cat:'giant',jaw:'very-strong'},
'saint-bernard':{name:'Saint Bernard',mod:0.7,cat:'giant',jaw:'strong'},
'akita':{name:'Akita',mod:0.7,cat:'large',jaw:'very-strong'},
'weimaraner':{name:'Weimaraner',mod:0.9,cat:'large',jaw:'moderate'},
'vizsla':{name:'Vizsla',mod:1.0,cat:'medium',jaw:'moderate'},
'bichon-frise':{name:'Bichon Frise',mod:1.6,cat:'small',jaw:'gentle'},
'mixed-breed':{name:'Mixed Breed',mod:1.0,cat:'medium',jaw:'moderate'},
'other':{name:'Other',mod:1.0,cat:'medium',jaw:'moderate'}
};

var WEIGHT_MODS={'under-15':1.6,'15-35':1.2,'35-60':0.9,'60-plus':0.7};
var CHEW_MODS={'gentle':1.5,'moderate':1.0,'aggressive':0.6};
var AGE_MODS={'puppy':1.3,'adult':1.0,'senior':1.4};
var VARIANT_BY_SIZE={
  'Small':'51744916701504',
  'Medium':'51744918962496',
  'Large':'51744918995264',
  'Extra Large':'51744919028032',
  'Jumbo':'51744919060800'
};

function analyze(breed,weight,chewStyle,age){
  var b=BREEDS[breed]||BREEDS['mixed-breed'];
  var raw=55*b.mod*(WEIGHT_MODS[weight]||1)*(CHEW_MODS[chewStyle]||1)*(AGE_MODS[age]||1);
  var duration={min:Math.max(10,Math.round(raw*0.85)),max:Math.max(15,Math.round(raw*1.15))};
  var score=7.5;
  if(b.jaw==='gentle')score+=1.2;else if(b.jaw==='moderate')score+=0.8;else if(b.jaw==='strong')score+=0.4;else score+=0.2;
  if(chewStyle==='gentle')score+=0.8;else if(chewStyle==='moderate')score+=0.5;else score+=0.2;
  if(age==='puppy')score+=0.5;else if(age==='senior')score+=0.7;else score+=0.3;
  var enrichment=Math.min(9.8,Math.round(score*10)/10);
  var benefits=[{icon:'\u{1F9D8}',text:'Evening calming ritual'}];
  if(chewStyle==='aggressive'){benefits.push({icon:'\u{1F4AA}',text:'Jaw muscle satisfaction'},{icon:'\u{1F9E0}',text:'Redirected chewing energy'});}
  else if(chewStyle==='moderate'){benefits.push({icon:'\u{1F3AF}',text:'Focused enrichment'},{icon:'\u{1F60C}',text:'Boredom reduction'});}
  else{benefits.push({icon:'\u{1F3E0}',text:'Crate enrichment'},{icon:'\u{1F4A4}',text:'Pre-bedtime relaxation'});}
  if(age==='puppy')benefits.push({icon:'\u{1F9B7}',text:'Healthy teething support'});
  else if(age==='senior')benefits.push({icon:'\u{1F9D3}',text:'Gentle dental maintenance'});
  else benefits.push({icon:'\u2728',text:'Natural dental cleaning'});
  var product;
  if(weight==='under-15')product={size:'Small',bundle:'Small Dog Starter Pack',count:'4-pack'};
  else if(weight==='15-35')product=chewStyle==='aggressive'?{size:'Medium',bundle:'Power Chewer Bundle',count:'3-pack'}:{size:'Medium',bundle:'Medium Dog Bundle',count:'3-pack'};
  else if(weight==='35-60')product=chewStyle==='aggressive'?{size:'Extra Large',bundle:'XL Power Chewer Pack',count:'2-pack'}:{size:'Large',bundle:'Large Dog Bundle',count:'3-pack'};
  else product=chewStyle==='aggressive'?{size:'Jumbo',bundle:'Giant Power Chewer Bundle',count:'2-pack'}:{size:'Extra Large',bundle:'Giant Breed Bundle',count:'2-pack'};
  var compat;
  if(chewStyle==='aggressive'&&(b.jaw==='very-strong'||b.jaw==='strong'))compat={label:'Excellent Match',score:95,note:'Yak chews are specifically designed for power chewers like yours!'};
  else if(chewStyle==='aggressive')compat={label:'Great Match',score:88,note:'Our dense yak cheese stands up to aggressive chewers.'};
  else if(chewStyle==='moderate')compat={label:'Perfect Match',score:96,note:'Ideal chew intensity for maximum enrichment time.'};
  else compat={label:'Wonderful Match',score:92,note:'Gentle chewers get the longest enrichment sessions!'};
  return{breed:b,duration:duration,enrichment:enrichment,benefits:benefits,product:product,compatibility:compat};
}

window.ChewAnalyzer=function(container,opts){
  this.el=container;this.opts=opts||{};this.step=0;this.answers={};this.isOpen=false;this.openedAt=0;this._init();
};
var CA=window.ChewAnalyzer.prototype;

CA._init=function(){
  this._render();
  if(this.el.dataset.placement==='product_page'){
    this.el.querySelector('.ca-widget').classList.add('ca-widget--modal');
  }
  this._bind();
  this._track('widget_loaded');
};

CA._render=function(){
  this.el.innerHTML=
  '<div class="ca-widget">'+
    '<div class="ca-trigger" role="button" tabindex="0" aria-label="Analyze how long a chew will last for your dog">'+
      '<div class="ca-trigger__content">'+
        '<div class="ca-trigger__icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/><path d="M9 14.5L12 17.5L19 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
        '<div class="ca-trigger__text"><span class="ca-trigger__title">How Long Will This Last For <em>MY</em> Dog?</span><span class="ca-trigger__subtitle">Get your personalized chew duration estimate</span></div>'+
        '<div class="ca-trigger__arrow"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
      '</div>'+
      '<div class="ca-trigger__badge"><span class="ca-trigger__badge-dot"></span>Smart estimate \u2022 30 seconds</div>'+
    '</div>'+
    '<div class="ca-panel" aria-hidden="true">'+
      '<div class="ca-panel__header">'+
        '<div class="ca-panel__progress"><div class="ca-panel__progress-bar"></div></div>'+
        '<div class="ca-panel__header-content">'+
          '<button class="ca-panel__back" aria-label="Go back" style="visibility:hidden"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
          '<span class="ca-panel__step-label">Step 1 of 4</span>'+
          '<button class="ca-panel__close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'+
        '</div>'+
      '</div>'+
      '<div class="ca-panel__body">'+
        '<div class="ca-step" data-step="1">'+
          '<h3 class="ca-step__title">What breed is your dog?</h3>'+
          '<p class="ca-step__subtitle">This helps us estimate jaw strength and chewing patterns</p>'+
          '<div class="ca-breed-search"><input type="text" class="ca-breed-search__input" placeholder="Search breed..." autocomplete="off"><div class="ca-breed-search__results"></div></div>'+
          '<div class="ca-breed-popular"><span class="ca-breed-popular__label">Popular:</span><div class="ca-breed-popular__list">'+
            '<button class="ca-breed-btn" data-breed="golden-retriever">Golden Retriever</button>'+
            '<button class="ca-breed-btn" data-breed="labrador-retriever">Labrador</button>'+
            '<button class="ca-breed-btn" data-breed="french-bulldog">French Bulldog</button>'+
            '<button class="ca-breed-btn" data-breed="german-shepherd">German Shepherd</button>'+
            '<button class="ca-breed-btn" data-breed="mixed-breed">Mixed Breed</button>'+
          '</div></div>'+
        '</div>'+
        '<div class="ca-step" data-step="2">'+
          '<h3 class="ca-step__title">How much does your dog weigh?</h3>'+
          '<p class="ca-step__subtitle">Weight affects chew duration significantly</p>'+
          '<div class="ca-cards">'+
            '<button class="ca-card" data-value="under-15"><span class="ca-card__emoji">\u{1F43E}</span><span class="ca-card__label">Under 15 lbs</span><span class="ca-card__desc">Tiny to small</span></button>'+
            '<button class="ca-card" data-value="15-35"><span class="ca-card__emoji">\u{1F415}</span><span class="ca-card__label">15\u201335 lbs</span><span class="ca-card__desc">Small to medium</span></button>'+
            '<button class="ca-card" data-value="35-60"><span class="ca-card__emoji">\u{1F9AE}</span><span class="ca-card__label">35\u201360 lbs</span><span class="ca-card__desc">Medium to large</span></button>'+
            '<button class="ca-card" data-value="60-plus"><span class="ca-card__emoji">\u{1F415}\u200D\u{1F9BA}</span><span class="ca-card__label">60+ lbs</span><span class="ca-card__desc">Large to giant</span></button>'+
          '</div>'+
        '</div>'+
        '<div class="ca-step" data-step="3">'+
          '<h3 class="ca-step__title">How does your dog chew?</h3>'+
          '<p class="ca-step__subtitle">Be honest \u2014 we will find the perfect match</p>'+
          '<div class="ca-cards ca-cards--chew">'+
            '<button class="ca-card ca-card--wide" data-value="gentle"><span class="ca-card__emoji">\u{1F607}</span><span class="ca-card__label">Gentle</span><span class="ca-card__desc">Nibbles slowly, savors the experience</span></button>'+
            '<button class="ca-card ca-card--wide" data-value="moderate"><span class="ca-card__emoji">\u{1F642}</span><span class="ca-card__label">Moderate</span><span class="ca-card__desc">Steady chewer, normal pace</span></button>'+
            '<button class="ca-card ca-card--wide" data-value="aggressive"><span class="ca-card__emoji">\u{1F996}</span><span class="ca-card__label">Aggressive</span><span class="ca-card__desc">Destroys toys, power chewer</span></button>'+
          '</div>'+
        '</div>'+
        '<div class="ca-step" data-step="4">'+
          '<h3 class="ca-step__title">How old is your dog?</h3>'+
          '<p class="ca-step__subtitle">Age affects chewing behavior and enrichment needs</p>'+
          '<div class="ca-cards">'+
            '<button class="ca-card" data-value="puppy"><span class="ca-card__emoji">\u{1F436}</span><span class="ca-card__label">Puppy</span><span class="ca-card__desc">Under 1 year</span></button>'+
            '<button class="ca-card" data-value="adult"><span class="ca-card__emoji">\u{1F415}</span><span class="ca-card__label">Adult</span><span class="ca-card__desc">1\u20137 years</span></button>'+
            '<button class="ca-card" data-value="senior"><span class="ca-card__emoji">\u{1F9D3}</span><span class="ca-card__label">Senior</span><span class="ca-card__desc">7+ years</span></button>'+
          '</div>'+
        '</div>'+
        '<div class="ca-step ca-step--results" data-step="results"><div class="ca-results"></div></div>'+
      '</div>'+
    '</div>'+
  '</div>';
};

CA._bind=function(){
  var self=this;
  this.el.querySelector('.ca-trigger').addEventListener('click',function(){self.open();});
  this.el.querySelector('.ca-trigger').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();self.open();}});
  this.el.querySelector('.ca-panel__close').addEventListener('click',function(){self.close();});
  this.el.querySelector('.ca-panel__back').addEventListener('click',function(){self.goBack();});
  var breedInput=this.el.querySelector('.ca-breed-search__input');
  breedInput.addEventListener('input',function(e){self._searchBreed(e.target.value);});
  breedInput.addEventListener('focus',function(){if(breedInput.value)self._searchBreed(breedInput.value);});
  this.el.querySelectorAll('.ca-breed-btn').forEach(function(btn){
    btn.addEventListener('click',function(){self._selectBreed(btn.dataset.breed);});
  });
  this.el.querySelectorAll('.ca-card').forEach(function(card){
    card.addEventListener('click',function(){
      self._selectCard(card,parseInt(card.closest('.ca-step').dataset.step));
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.ca-breed-search')){
      var r=self.el.querySelector('.ca-breed-search__results');
      if(r)r.classList.remove('ca-breed-search__results--visible');
    }
  });
};

CA.open=function(){
  this.isOpen=true;
  this.openedAt=Date.now();
  this.el.querySelector('.ca-widget').classList.add('ca-widget--open');
  this.el.querySelector('.ca-panel').setAttribute('aria-hidden','false');
  if(this.el.querySelector('.ca-widget--modal'))document.body.style.overflow='hidden';
  this._goTo(1);
  this._track('widget_opened');
};

CA.close=function(){
  if(this.openedAt)this._track('engagement_time',{seconds:Math.round((Date.now()-this.openedAt)/1000),step:this.step});
  this.isOpen=false;
  this.el.querySelector('.ca-widget').classList.remove('ca-widget--open');
  this.el.querySelector('.ca-panel').setAttribute('aria-hidden','true');
  if(this.el.querySelector('.ca-widget--modal'))document.body.style.overflow='';
  this._track('widget_closed',{step:this.step});
  this.step=0;
};

CA.goBack=function(){if(this.step>1)this._goTo(this.step-1);};

CA._goTo=function(s){
  this.step=s;
  this.el.querySelectorAll('.ca-step').forEach(function(el){el.classList.remove('ca-step--active');});
  var target=this.el.querySelector('.ca-step[data-step="'+s+'"]');
  if(target)requestAnimationFrame(function(){target.classList.add('ca-step--active');});
  var pct=s==='results'?100:((s-1)/4)*100;
  this.el.querySelector('.ca-panel__progress-bar').style.width=pct+'%';
  var label=this.el.querySelector('.ca-panel__step-label');
  label.textContent=s==='results'?'Your Results':'Step '+s+' of 4';
  this.el.querySelector('.ca-panel__back').style.visibility=(s>1&&s!=='results')?'visible':'hidden';
  this._track('step_viewed',{step:s});
};

CA._searchBreed=function(q){
  var self=this;
  var box=this.el.querySelector('.ca-breed-search__results');
  if(!q){box.classList.remove('ca-breed-search__results--visible');return;}
  var matches=Object.keys(BREEDS).filter(function(k){return BREEDS[k].name.toLowerCase().indexOf(q.toLowerCase())!==-1;}).slice(0,6);
  if(!matches.length)matches=['mixed-breed'];
  box.innerHTML=matches.map(function(k){
    var b=BREEDS[k];
    return '<div class="ca-breed-result" data-breed="'+k+'"><span class="ca-breed-result__name">'+b.name+'</span><span class="ca-breed-result__category">'+b.cat+'</span></div>';
  }).join('');
  box.classList.add('ca-breed-search__results--visible');
  box.querySelectorAll('.ca-breed-result').forEach(function(el){
    el.addEventListener('click',function(){
      self._selectBreed(el.dataset.breed);
      box.classList.remove('ca-breed-search__results--visible');
    });
  });
};

CA._selectBreed=function(key){
  var self=this;
  this.answers.breed=key;
  this.el.querySelector('.ca-breed-search__input').value=BREEDS[key].name;
  this._track('breed_selected',{breed:key});
  setTimeout(function(){self._goTo(2);},350);
};

CA._selectCard=function(card,stepNum){
  var self=this;
  card.parentElement.querySelectorAll('.ca-card').forEach(function(c){c.classList.remove('ca-card--selected');});
  card.classList.add('ca-card--selected');
  var val=card.dataset.value;
  if(stepNum===2)this.answers.weight=val;
  else if(stepNum===3)this.answers.chewStyle=val;
  else if(stepNum===4)this.answers.age=val;
  this._track('answer_selected',{step:stepNum,value:val});
  setTimeout(function(){
    if(stepNum<4)self._goTo(stepNum+1);
    else self._showResults();
  },350);
};

CA._showResults=function(){
  var a=this.answers;
  var r=analyze(a.breed,a.weight,a.chewStyle,a.age);
  var box=this.el.querySelector('.ca-results');
  var bHTML=r.benefits.map(function(b){return '<div class="ca-result__benefit"><span class="ca-result__benefit-icon">'+b.icon+'</span><span>'+b.text+'</span></div>';}).join('');
  box.innerHTML=
    '<div class="ca-result__header">'+
      '<div class="ca-result__badge">'+r.compatibility.label+'</div>'+
      '<h3 class="ca-result__title">For your '+r.breed.name+'</h3>'+
      '<p class="ca-result__note">'+r.compatibility.note+'</p>'+
    '</div>'+
    '<div class="ca-result__metrics">'+
      '<div class="ca-result__metric ca-result__metric--primary">'+
        '<span class="ca-result__metric-label">Estimated Chew Duration</span>'+
        '<span class="ca-result__metric-value"><span class="ca-result__num" data-target="'+r.duration.min+'">0</span>\u2013<span class="ca-result__num" data-target="'+r.duration.max+'">0</span> min</span>'+
      '</div>'+
      '<div class="ca-result__metric">'+
        '<span class="ca-result__metric-label">Enrichment Score</span>'+
        '<span class="ca-result__metric-value"><span class="ca-result__num" data-target="'+r.enrichment+'">0</span>/10</span>'+
        '<div class="ca-result__bar"><div class="ca-result__bar-fill" data-width="'+(r.enrichment*10)+'"></div></div>'+
      '</div>'+
    '</div>'+
    '<div class="ca-result__benefits"><h4 class="ca-result__benefits-title">Best For:</h4>'+bHTML+'</div>'+
    '<div class="ca-result__recommendation">'+
      '<h4 class="ca-result__rec-title">Recommended for your dog:</h4>'+
      '<div class="ca-result__rec-product"><span class="ca-result__rec-size">'+r.product.size+' Yak Chew</span><span class="ca-result__rec-bundle">'+r.product.bundle+' ('+r.product.count+')</span></div>'+
    '</div>'+
    '<form class="ca-result__email" data-action="email-capture" method="post" action="/contact#contact_form">'+
      '<input type="hidden" name="form_type" value="customer">'+
      '<input type="hidden" name="utf8" value="✓">'+
      '<input type="hidden" name="contact[tags]" value="chew-analyzer,chew-recommendation">'+
      '<label class="ca-result__email-label">Get this recommendation by email</label>'+
      '<div class="ca-result__email-row"><input type="email" name="contact[email]" placeholder="Email address" required><button type="submit">Send</button></div>'+
      '<p class="ca-result__email-note">Chew tips, size guidance, and Prime Pet Food offers. No spam.</p>'+
    '</form>'+
    '<div class="ca-result__actions">'+
      '<button class="ca-result__btn ca-result__btn--primary" data-action="add-to-cart">Add Recommended Pack</button>'+
      '<button class="ca-result__btn ca-result__btn--secondary" data-action="subscribe">Subscribe & Save 15%</button>'+
    '</div>'+
    '<button class="ca-result__restart" data-action="restart">Analyze another dog \u2192</button>';
  this._goTo('results');
  this._animateResults();
  this._bindResultActions(r);
  this._track('completed',{breed:a.breed,weight:a.weight,chewStyle:a.chewStyle,age:a.age,durationMin:r.duration.min,durationMax:r.duration.max,enrichment:r.enrichment,aggressiveChewer:a.chewStyle==='aggressive',recommendedSize:r.product.size});
  try {
    window.dispatchEvent(new CustomEvent('prime:analyzer:complete', {
      detail: {
        breed: a.breed,
        weight: a.weight,
        chewStyle: a.chewStyle,
        age: a.age,
        durationMin: r.duration.min,
        durationMax: r.duration.max,
        durationRange: r.duration.min + '-' + r.duration.max + ' minutes',
        enrichment: r.enrichment,
        recommendedSize: r.product.size,
        recommendedBundle: r.product.bundle,
        recommendedVariantId: VARIANT_BY_SIZE[r.product.size] || '',
        placement: this.el.dataset.placement || 'unknown'
      }
    }));
  } catch(e) {}
  this._track('results_shown',{breed:a.breed,weight:a.weight,chewStyle:a.chewStyle,age:a.age,durationMin:r.duration.min,durationMax:r.duration.max,enrichment:r.enrichment});
};

CA._animateResults=function(){
  this.el.querySelectorAll('.ca-result__num').forEach(function(el){
    var target=parseFloat(el.dataset.target);var isFloat=target%1!==0;var start=performance.now();
    (function tick(now){
      var p=Math.min((now-start)/1200,1);var eased=1-Math.pow(1-p,3);
      el.textContent=isFloat?(eased*target).toFixed(1):Math.round(eased*target);
      if(p<1)requestAnimationFrame(tick);
    })(start);
  });
  var bar=this.el.querySelector('.ca-result__bar-fill');
  if(bar)setTimeout(function(){bar.style.width=bar.dataset.width+'%';},200);
};

CA._bindResultActions=function(result){
  var self=this;
  var addBtn=this.el.querySelector('[data-action="add-to-cart"]');
  var subBtn=this.el.querySelector('[data-action="subscribe"]');
  var restart=this.el.querySelector('[data-action="restart"]');
  var emailForm=this.el.querySelector('[data-action="email-capture"]');
  var productUrl=this.el.dataset.productUrl||'/products/himalayan-yak-chews-for-dogs';
  var variantId=VARIANT_BY_SIZE[result.product.size]||'';
  var productQueryLink=productUrl+(variantId?(productUrl.indexOf('?')===-1?'?':'&')+'variant='+variantId:'');
  var productDeepLink=productQueryLink+'#chew-analyzer-widget';
  if(addBtn)addBtn.addEventListener('click',function(){
    self._track('add_to_cart_clicked',Object.assign({},self.answers,{recommendedSize:result.product.size,variantId:variantId}));
    if(variantId)window.location.href='/cart/add?id='+variantId+'&quantity=1&return_to=/cart';
    else window.location.href=productDeepLink;
  });
  if(subBtn)subBtn.addEventListener('click',function(){
    self._track('subscribe_clicked',Object.assign({},self.answers,{recommendedSize:result.product.size,variantId:variantId}));
    window.location.href=productQueryLink+(productQueryLink.indexOf('?')===-1?'?':'&')+'selling_plan=true#subscribe';
  });
  if(emailForm)emailForm.addEventListener('submit',function(e){
    e.preventDefault();
    var email=emailForm.querySelector('input[type="email"]').value;
    if(!email)return;
    self._track('email_capture_submitted',Object.assign({},self.answers,{emailDomain:(email.split('@')[1]||'').toLowerCase()}));
    fetch(emailForm.action,{method:'POST',body:new FormData(emailForm),credentials:'same-origin'})
      .then(function(){emailForm.innerHTML='<p class="ca-result__email-success">Recommendation saved. Check your inbox for Prime Pet Food chew tips.</p>';})
      .catch(function(){emailForm.submit();});
  });
  if(restart)restart.addEventListener('click',function(){
    self.answers={};
    self.el.querySelectorAll('.ca-card--selected').forEach(function(c){c.classList.remove('ca-card--selected');});
    self.el.querySelector('.ca-breed-search__input').value='';
    self._goTo(1);
    self._track('restart_clicked');
  });
};

CA._track=function(event,data){
  data=data||{};data.feature='chew_analyzer';
  data.placement=this.el.dataset.placement||'unknown';
  data.productId=this.el.dataset.productId||'';
  data.productTitle=this.el.dataset.productTitle||'';
  if(window.gtag)window.gtag('event','chew_analyzer_'+event,data);
  if(window.posthog)window.posthog.capture('chew_analyzer_'+event,data);
  if(window.Shopify&&window.Shopify.analytics&&typeof window.Shopify.analytics.publish==='function'){
    try{window.Shopify.analytics.publish('chew_analyzer_'+event,data);}catch(e){}
  }
  try{document.dispatchEvent(new CustomEvent('chew-analyzer:'+event,{detail:data}));}catch(e){}
};

// Sticky CTA intentionally disabled. The estimator still works through inline links.
window.ChewAnalyzerStickyCTA=function(){};

// Auto-init
function initAll(){
  document.querySelectorAll('.ca-widget-container').forEach(function(el){
    if(!el._chewAnalyzer)el._chewAnalyzer=new window.ChewAnalyzer(el);
  });
  document.querySelectorAll('[data-ca-open-target]').forEach(function(link){
    if(link._caBound)return;
    link._caBound=true;
    link.addEventListener('click',function(e){
      var target=document.querySelector(link.getAttribute('data-ca-open-target'));
      if(!target)return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(function(){if(target._chewAnalyzer&&!target._chewAnalyzer.isOpen)target._chewAnalyzer.open();},450);
    });
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAll);
else initAll();

})();
