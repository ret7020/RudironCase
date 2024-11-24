let idCounter = 0;
var DividerFlag = document.querySelectorAll('#code-contents .divider').length;

function blockDragStart(e) {
  e.target.style.opacity = '1';
  e.dataTransfer.setData('text', e.target.id);

  if (DividerFlag==1){
    document
    .querySelectorAll('#code-contents .divider')
    .forEach((d) => d.classList.add('drop-zone'));
  }else{
    document
    .querySelectorAll('#code-contents .divider')
    .forEach((d) => 
      d.addEventListener('dragover', () => {
          d.classList.add('drop-zone'); 
      }));
  }


}
function blockDragEnd(e) {
  e.target.style.opacity = '1';

  if (e.target.hasAttribute('data-instance')) {
    const trash = document.getElementById('trash');
    trash.classList.remove('drop-zone');
  }

  document
    .querySelectorAll('#code-contents .divider')
    .forEach((d) => 
      // Событие dragover для обработки перетаскивания
      d.addEventListener('dragleave', () => {
          d.classList.remove('drop-zone'); // Добавляем класс drop-zone при перетаскивании
      }));
  DividerFlag = document.querySelectorAll('#code-contents .divider').length;
    
}

function dividerDragOver(e) {
  e.preventDefault();
}


function dividerDrop(e) {
  e.preventDefault();
  e.target.classList.remove('drop-zone');
  const data = e.dataTransfer.getData("text");
  const elem = document.getElementById(data);

  if (elem.hasAttribute('data-instance')) {
    moveDrop(e, elem);
  } else {
    cloneDrop(e, elem);
  }
}

function moveDrop(e, elem) {
  const divider = elem.nextSibling;
  elem.style.opacity = '1';
  e.target.insertAdjacentElement('afterend', elem);
  elem.insertAdjacentElement('afterend', divider);
}

function cloneDrop(e, node) {
  const elem = node.cloneNode(true);
  elem.id = elem.id + idCounter++;
  elem.setAttribute('data-instance', '')
  elem.style.opacity = '1';
  e.target.insertAdjacentElement('afterend', elem);
  elem.insertAdjacentElement('afterend', e.target.cloneNode(true));
}

function removeDragOver(e) {
  e.preventDefault();
  cont = document.getElementById(trash_block);
  trash = document.getElementsByClassName(trashЭ);
  cont.addEventListener('dragover', function(){
    trash.style.background = "orange";
  });
}

function removeDrop(e) {
  e.preventDefault();
  e.target.classList.remove('drop-zone');
  const data = e.dataTransfer.getData("text");
  const elem = document.getElementById(data);
  if (elem.hasAttribute('data-instance')) {
    const divider = elem.nextSibling;
    elem.remove();
    divider.remove();
  }

  
  DividerFlag = document.querySelectorAll('#code-contents .divider').length;
}
