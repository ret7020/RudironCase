
function isBlock(elem) {
  return elem.hasAttribute('data-cmd');
}

function childBlocks(slot) {
  const kids = [];
  for (const child of slot.children) {
    if (isBlock(child)) {
      kids.push(child);
    }
  }
  return kids;
}

function createInput(param) {
  var input = '';
  if (param.select_from){
    input = document.createElement('select');
    input.classList.add('input_option');
    for (var i = 0; i < param.select_from.length; i++){
      var option = document.createElement("option");
      option.value = param.select_from[i];
      option.text = param.select_from[i];
      input.appendChild(option);
    }

  } else {
    input = document.createElement('input');
    if (param.val) input.placeholder = param.val;
  }
  
  input.setAttribute('data-param-id', param.id);
  
  const field = document.createElement('div');
  field.classList.add('block-field');
  field.appendChild(input);

  field.appendChild(document.createTextNode(param.suffix))

  const block = document.createElement('div');
  block.classList.add('block-arg');

  const label_span = document.createElement('span');
  label_span.innerText = param.label;
  block.appendChild(label_span);

  block.appendChild(field);
  return block;
}

function createColorInput(param) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = param.val;
  input.setAttribute('data-param-id', param.id);

  const field = document.createElement('div');
  field.classList.add('block-field');
  field.classList.add('block-field-color');
  field.appendChild(input);

  const block = document.createElement('div');
  block.classList.add('block-arg');
  block.appendChild(document.createTextNode(param.label));
  block.appendChild(field);
  return block;
}

function createDivider() {
  const divider = document.createElement('div');
  divider.classList.add('divider');
  divider.draggable = true;
  divider.setAttribute('ondragover', 'dividerDragOver(event)');
  divider.setAttribute('ondrop', 'dividerDrop(event)');
  return divider;
}

function createSlot(param) {
  const divider = createDivider();

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-param-id', param.id);
  wrapper.classList.add('blocks-wrapper');
  wrapper.appendChild(divider);

  const slot = document.createElement('div');
  slot.classList.add('blocks');
  slot.appendChild(wrapper);
  return slot;
}

function createLabel(param) {
  const block = document.createElement('div');
  block.classList.add('block-arg');
  block.appendChild(document.createTextNode(param.label));
  return block;
}

function createBlockParam(param) {
  switch (param.type) {
    case 'input':
      return createInput(param);
    case 'color':
      return createColorInput(param);
    case 'slot':
      return createSlot(param);
    default:
      return createLabel(param);
  }
}

function createBlock(cmd, opts, auto = false, block_id = -1) {
  const block = document.createElement('div');
  block.id = cmd;
  if (auto) {
    block.id = `${cmd}${block_id}`;
  }
  block.setAttribute('data-cmd', cmd);
  block.setAttribute('data-i18n-block', cmd);
  block.classList.add('block');
  block.style.borderLeftColor = opts.color || block.style.borderLeftColor;
  block.draggable = true;
  block.setAttribute('ondragstart', 'blockDragStart(event)');
  block.setAttribute('ondragend', 'blockDragEnd(event)');
  if (auto) {
    block.setAttribute("data-instance", "");
  }
  for (const param of opts.params || []) {
    block.appendChild(createBlockParam(param));
  }
  return block;
}

function addBlocks(container, cmds) {
  for (const [cmd, opts] of Object.entries(cmds)) {
    container.appendChild(createBlock(cmd, opts));

  }
}