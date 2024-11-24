// TODO: variables

const menu = document.getElementById('menu-contents');
const code = document.getElementById('code-contents');
const canvas = document.getElementById("canvas");

function setup(plugin) {
  addBlocks(menu, plugin.cmds);
  vm.install(plugin);
}

async function run() {
  vm.init(canvas);
  await executeSeq(vm.runSeq(code.children));
}

function runToC() {
  vm.init(canvas);
  return translateToC(vm.runSeq(code.children));
}



function purge() {
  code.innerHTML = '';
  code.appendChild(createDivider());
  DividerFlag = document.querySelectorAll('#code-contents .divider').length;
}

function purgeOnConfirm() {
  if (confirm('Удалить все блоки?')) {
    purge();
  }
}

purge();
setup(logo);