const vm = {
  env: {},
  cmds: {},
  plugins: [],


  init(canvas) { },


  initPlugins() {
    for (const plugin of this.plugins) {
      plugin.init(this.env);
    }
  },

  install(plugin) {
    this.cmds = Object.assign(this.cmds, plugin.cmds);
    this.plugins.push(plugin);
  },

  runSeq(blocks) {
    var json_compiled = [];
    var temp_block_dt;
    var if_counter = 0;
    for (const block of blocks) {
      // console.log(block);
      if (block.hasAttribute('data-cmd')) {
        temp_block_dt = this.run(block);
        if (temp_block_dt != null) {
          if (temp_block_dt[0] == "single") {
            var el = {};
            el["action"] = temp_block_dt[1]["action"];
            $.each(temp_block_dt[1]["data"], function (index, val) {
              $.each(val, function (index, val) {
                el[index] = val;
              });
            });
            json_compiled.push(el);
          } else if (temp_block_dt[0] == "multiple") {
            var node_blocks = [];
            $.each(temp_block_dt[1], function (index, val) {
              node_blocks.push(val);
            });
            json_compiled.push({ "action": temp_block_dt[2], "blocks": node_blocks });
          } else if (temp_block_dt[0] == "if") {
            json_compiled.push({ "action": temp_block_dt[4], "true_blocks": temp_block_dt[1], "false_blocks": temp_block_dt[2], "var": temp_block_dt[3] });
          } else if (temp_block_dt[0] == "repeat") {
            json_compiled.push({ "action": temp_block_dt[3], "times": temp_block_dt[2], "blocks": temp_block_dt[1] });
          } else if (temp_block_dt[0] == "while") {
            json_compiled.push({ "action": temp_block_dt[3], "var": temp_block_dt[1], "blocks": temp_block_dt[2] });
          }
        }
      }
    }
    $(".json_source").html(prettyPrintJson.toHtml(json_compiled));
    $(".download_json").css("display", "block");
    $(".raw_json").html(JSON.stringify(json_compiled));

    return json_compiled;
  },
  run(block) {
    const cmd = block.getAttribute('data-cmd');
    const params = this.cmds[cmd].params || [];
    const args = [];
    const params_names = [];
    for (const param of params) {
      const elem = block.querySelector(`[data-param-id="${param.id}"]`)
      switch (param.type) {
        case 'input':
          args.push(elem.value);
          var array_dt = {};
          array_dt[param.id] = elem.value;
          params_names.push(array_dt);
          break;
        case 'slot':
          args.push(childBlocks(elem));
          break;
      }

    }

    if (cmd != "repeat" && cmd != "if" && cmd != "void_setup" && cmd != "void_loop" && cmd != "while") {
      return ["single", { "action": cmd, "data": params_names }, cmd];
    } else if (cmd == "repeat") {
      var [final_iter, times] = this.cmds[cmd].run(this, ...args);
      console.log(times);
      return ["repeat", final_iter, `${times}`, cmd];
    } else if (cmd == "void_setup" || cmd == "void_loop") {
      var final_iter = this.cmds[cmd].run(this, ...args);
      return ["multiple", final_iter, cmd];
    } else if (cmd == "if") {
      var [true_blocks, false_blocks] = this.cmds[cmd].run(this, ...args);
      return ["if", true_blocks, false_blocks, params_names[0]["var_check"], cmd];
    } else if (cmd == "while") {
      var [var_to_check, body] = this.cmds[cmd].run(this, ...args);
      return ["while", var_to_check, body, cmd];
    }


  }
};
