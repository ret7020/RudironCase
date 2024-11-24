const logo = {

  init(env) { },

  cmds: {
    repeat: {
      color: '#0ebeff',
      params: [
        {
          id: 'reps',
          type: 'input',
          conv: parseInt,
          label: 'Цикл с счетчиком',
          val: 2,
          suffix: '',
        }, {
          id: 'body',
          type: 'slot',
        }
      ],
      run(vm, times, blocks) {
        var final_node = [];
        $.each(vm.runSeq(blocks), function (index, val) {
          final_node.push(val);
        });
        return [final_node, `${times}`];
      },
    },

    while: {
      color: '#0ebeff',
      params: [
        {
          id: 'cond',
          type: 'input',
          conv: parseInt,
          label: 'Цикл с условием',
          val: "условие",
          suffix: '',
        }, {
          id: 'body',
          type: 'slot',
        }
      ],
      run(vm, var_to_check, blocks, blocks2) {
        var body = [];

        $.each(vm.runSeq(blocks), function (index, val) {
          body.push(val);
        });

        return [var_to_check, body];
      },
    },


    if: {
      color: '#b37635',
      params: [
        {
          id: 'var_check',
          type: 'input',
          conv: parseInt,
          label: 'Если',
          val: 'условие',
          suffix: '',
        }, {
          id: 'true_blocks',
          type: 'slot',
        }, {
          label: 'Иначе',
        }, {
          id: 'false_blocks',
          type: 'slot',
        }
      ],
      run(vm, times, blocks, blocks2) {
        var true_blocks = [];
        var false_blocks = [];

        $.each(vm.runSeq(blocks), function (index, val) {
          true_blocks.push(val);
        });

        $.each(vm.runSeq(blocks2), function (index, val) {
          false_blocks.push(val);
        });
        return [true_blocks, false_blocks];
      },
    },

    delay: {
      color: '#00ffb7',
      params: [
        {
          id: 'delay',
          type: 'input',
          conv: parseInt,
          label: 'Задержка',
          val: "300 ms",
          suffix: ''
        },

      ],
      run(vm) {
      }
    },

    set_var: {
      color: 'red',
      params: [
        {
          id: 'name',
          type: 'input',
          conv: parseInt,
          label: 'Переменная',
          val: "название",
          suffix: ''
        },
        {
          id: 'val',
          type: 'input',
          conv: parseInt,
          label: 'Значение',
          val: "",
          suffix: '',
        },

      ],
      run(vm) { }
    },


    pin_mode: {
      color: 'black',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Пин',
          val: "5",
          suffix: ''
        },
        {
          id: 'mode',
          type: 'input',
          conv: parseInt,
          label: 'Режим',
          val: "",
          suffix: '',
          select_from: ["чтение", "запись", "подтяжка"]
        },

      ],
      run(vm) { }
    },


    dpin_write: {
      color: '#848591',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Цифровой пин',
          val: "5",
          suffix: '',
        },
        {
          id: 'val',
          type: 'input',
          conv: parseInt,
          label: 'Значение',
          val: "",
          suffix: ''
        },

      ],
      run(vm) { }
    },

    dpin_read: {
      color: '#848591',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Цифровой пин',
          val: "5",
          suffix: '',
        },
        {
          id: 'var',
          type: 'input',
          conv: parseInt,
          label: 'Переменная',
          val: "название",
          suffix: ''
        },

      ],
      run(vm) { }
    },

    apin_write: {
      color: '#42f563',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Аналоговый пин',
          val: "5",
          suffix: '',
        },
        {
          id: 'val',
          type: 'input',
          conv: parseInt,
          label: 'Значение',
          val: "",
          suffix: ''
        },

      ],
      run(vm) { }
    },

    apin_read: {
      color: '#42f563',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Аналоговый пин',
          val: "5",
          suffix: '',
        },
        {
          id: 'var',
          type: 'input',
          conv: parseInt,
          label: 'Переменная',
          val: "название",
          suffix: ''
        },

      ],
      run(vm) { }
    },


    led_set: {
      color: 'black',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Светодиод',
          val: "5",
          suffix: '',
          select_from: ["L1", "L2"]
        },
        {
          id: 'var',
          type: 'input',
          conv: parseInt,
          label: 'Состояние',
          val: "",
          suffix: '',
          select_from: ["Выкл", "Вкл"]
        },

      ],
      run(vm) { }
    },
    btn_read: {
      color: 'black',
      params: [
        {
          id: 'pin',
          type: 'input',
          conv: parseInt,
          label: 'Кнопка',
          val: "5",
          suffix: '',
          select_from: ["B1", "B2", "B3"]
        },
        {
          id: 'var',
          type: 'input',
          conv: parseInt,
          label: 'Переменная',
          val: "название",
          suffix: ''
        },

      ],
      run(vm) { }
    },

    serial_print: {
      color: 'red',
      params: [
        {
          id: 'text',
          type: 'input',
          conv: parseInt,
          label: 'Текст',
          val: "RUDIRON",
          suffix: '',
        },
        {
          id: 'var',
          type: 'input',
          conv: parseInt,
          label: 'Переменная',
          val: "название",
          suffix: ''
        },

      ],
      run(vm) { }
    },

    void_loop: {
      color: 'green',
      params: [
        {
          id: 'void_loop',
          type: 'none',
          conv: parseInt,
          label: 'Бесконечный цикл',
        }, {
          id: 'body',
          type: 'slot',
        }
      ],
      run(vm, blocks) {
        console.log(blocks);
        var final_node = [];
        $.each(vm.runSeq(blocks), function (index, val) {
          final_node.push(val);
        });
        return final_node;
      },
    },

    void_setup: {
      color: 'green',
      params: [
        {
          id: 'void_setup',
          type: 'none',
          conv: parseInt,
          label: 'Настройки',
        }, {
          id: 'body',
          type: 'slot',
        }
      ],
      run(vm, blocks) {
        console.log(blocks);
        var final_node = [];
        $.each(vm.runSeq(blocks), function (index, val) {
          final_node.push(val);
        });
        return final_node;
      },
    },
  }

};
