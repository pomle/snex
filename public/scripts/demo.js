window.addEventListener('load', function() {
  if (!snex.isSupported()) {
    return;
  }

  function ControllerFactory() {
    const template = document.querySelector('template.controller');
    const pool = document.querySelector('.demo .controllers');
    let count = 0;

    return function createController(type, channel) {
      const element = document
        .importNode(template.content, true)
        .children[0];

      if (++count === 1) {
        element.classList.remove('hidden');
      }

      const link = document.createElement('a');
      link.target = '_blank';

      const iframe = element.querySelector('iframe');

      pool.appendChild(element);

      snex.createSession(API_KEY, channel, type)
      .then(session => {
          iframe.src = session.url;
          link.href = session.url;
          link.textContent = session.url;
      });

      return {
        el: element,
        link,
      }
    }
  }

  function Carousel(set, link) {
    this.skip = function(skip) {
      let active;
      set.forEach((cont, i) => {
        const el = cont.el;
        if (!el.classList.contains('hidden')) {
          const next = offset(i, skip, set.length);
          active = set[next];
          link.innerHTML = '';
        }
        el.classList.add('hidden');
      });
      active.el.classList.remove('hidden');
      link.appendChild(active.link);
    }
  }

  function offset(input, diff, max) {
      const next = input + diff;
      return (next % max + max) % max;
  }

  function getAPIKey() {
    return document.body.attributes['data-api-key'].value;
  }

  function getControllerList() {
    return document.body.attributes['data-controllers'].value.split(',');
  }

  function resize() {
    canvas.width = canvas.getBoundingClientRect().width;
  }

  const API_KEY = getAPIKey();
  const demoElement = document.querySelector('.demo');

  const link = document.querySelector('.demo .link');
  const controllers = [];
  const carousel = new Carousel(controllers, link);
  const createController = ControllerFactory();

  const log = demoElement.querySelector('.log');
  const canvas = demoElement.querySelector('canvas');
  const game = new SpaceGame(canvas);

  const peer = new Peer({key: API_KEY});
  peer.on('open', function(id) {

    document.body.classList.add('supported');

    getControllerList().forEach(type => {
      const e = createController(type, id);
      controllers.push(e);
    });

    carousel.skip(0);

    const player = game.addPlayer();

    peer.on('connection', function(conn) {
      conn.on('data', function(data) {
        log.textContent = JSON.stringify(data);
        const { key, state } = data;
        if (state && key === 'UP') {
          player.dir.x = 0;
          player.dir.y = -1;
        } else if (state && key === 'DOWN') {
          player.dir.x = 0;
          player.dir.y = 1;
        } else if (state && key === 'LEFT') {
          player.dir.x = -1;
          player.dir.y = 0;
        } else if (state && key === 'RIGHT') {
          player.dir.x = 1;
          player.dir.y = 0;
        } else if (key === 'B' && state) {
          player.shoot();
        } else if (key === 'A') {
          player.thrust = state;
        }
      });
    });
  });

  window.addEventListener('resize', resize);


  const switches = demoElement.querySelectorAll('.input [data-skip]');
  [...switches].forEach(sw => {
    const skip = parseInt(sw.getAttribute('data-skip'), 10);
    sw.addEventListener('click', () => carousel.skip(skip));
  });

  resize()
});
