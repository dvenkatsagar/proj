//Commands related to plain text
var cmds = {
    "*val" : function(val){$("#editor-textarea-body").addText(val);}
}

speech.addCommands(cmds);
console.log(cmds);

//Disabling click handler of edit button
$(document).off("click","#editor-edit-lbl");
