//New Html Element Template
var itemStructure='<div class="container-fluid">'+
            '<div class="row">'+
                '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                    '<div class="panel panel-primary">'+
                        '<div class="panel-heading">'+
                            '<span>Tag</span>'+
                        '</div>'+
                        '<div class="panel-footer">'+
                            '<div class="form-group" id="editor-modal-tags">'+
                                '<select class="form-control combobox" id="editor-modal-tags-list">'+
                                '</select>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<hr />'+
            '<div class="row">'+
                '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                    '<div class="panel panel-primary">'+
                        '<div class="panel-heading">'+
                            '<span>Attribute List</span>'+
                            '<div class="pull-right">'+
                                '<a type="button" href="#" class="btn btn-xs btn-primary" id="editor-modal-attrs-add"><i class="fa fa-plus fa-fw"></i></a>'+
                            '</div>'+
                        '</div>'+
                        '<table class="table table-striped table-responsive table-condensed">'+
                            '<thead>'+
                                '<tr>'+
                                    '<th class="text-center">Name</th>'+
                                    '<th class="text-center">Value</th>'+
                                    '<th class="text-center">Delete?</th>'+
                                '</tr>'+
                            '</thead>'+
                            '<tbody id="editor-modal-attrs-list">'+
                            '</tbody>'+
                        '</table>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>';

var textboxStructure = '<div class="container-fluid">'+
                            '<div class="row">'+
                                '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                    '<textarea class="form-control col-xs-12 col-sm-12 col-md-12 col-lg-12" id="editor-modal-textarea-body" autofocus></textarea>'
                                '</div>'+
                            '</div>'+
                        '</div>';

// Html Item Dialog
var ItemModal = function(value){
    //Load the language json file
    $.getJSON("./public/res/languages/language-html.json",function(data){
        //If user says either "tag" or "element",then do this
        if (value.indexOf("tag") == 0 || value.indexOf("element") == 0){
            //Get Line statistics
            var line = $("#editor-textarea-body").getLines();
            //Get Cursor statistics
            var curs = $("#editor-textarea-body").textrange();
            //Check is cursor position is on a tag or not
            var istag = isTag(line);
            console.log(istag);
            //If it is a tag, determine the tag and the text before and after the tag
            if (istag == 1){
                var cpos = curs["position"];
                var cpos_init = curs["position"] - line.current_line_start.length - line.previous_lines.length;
                if (cpos_init == 0){
                    cpos = cpos - line.previous_lines.length;
                }else{
                    cpos = cpos - line.previous_lines.length - 1;
                }
                var cstart = 0;
                var cend = 0;

                for (var i = cpos; i >= 0; i--){
                    if(line.current_line.charAt(i) == "<"){
                        cstart = i;
                        break;
                    }
                }
                for (var i = cpos; i <= line.current_line.length; i++){
                    if (line.current_line.charAt(i) == ">"){
                        cend = i;
                        break;
                    }
                }
                if (cpos_init == 0){
                    cstart = line.previous_lines.length + cstart;
                    cend = line.previous_lines.length + cend;
                }else{
                    cstart = line.previous_lines.length + cstart + 1;
                    cend = line.previous_lines.length + cend + 1;
                }
                var tag = $("#editor-textarea-body").val().substring(cstart,cend+1).trim();
                console.log("tag = "+tag);
                line.current_line_start = $("#editor-textarea-body").val().substring(line.previous_lines.length,cstart).trim();
                console.log("line_start = "+line.current_line_start);
                line.current_line_end =  $("#editor-textarea-body").val().substring(cend+1,line.previous_lines.length + line.current_line.length + 1).trim();
                console.log("line_end = "+line.current_line_end);
            }

            //Load Default structure of the Modal
            $("#editor-modal").html(modalStructure);
            //If it is trailing tag, then simple show a message
            if (istag == 0){
                $("#editor-modal-false").hide();
                $("#editor-modal-body").html("This is a trailing tag (or ending tag). Cannot edit it.");
            }else{
                //else create the form
                $("#editor-modal-body").html(itemStructure);
                var items = [];
                items.push('<option></option>');
                for (i=0; i<=data["tags"].length;i++){
                    items.push('<option value="'+data["tags"][i]+'">'+data["tags"][i]+'</option>');
                }
                $("#editor-modal-tags-list").html(items.join(""));
                $("#editor-modal-tags-list").combobox();

                var attritem =  '<tr class="form-group">'+
                                    '<td><input type="text" name="attrname" class="form-control input-sm" placeholder="attribute name" /></td>'+
                                    '<td><input type="text" name="attrval" class="form-control input-sm" placeholder="attribute value" /></td>'+
                                    '<td class="text-center delete-row"><a href="#" class="btn btn-default btn-xs"><i class="fa fa-times fa-sm"></i></a></td>'+
                                '</tr>'

                $("#editor-modal-attrs-list").append(attritem);
            }
            //If it tag, obtain the attributes and show it in the form
            if (istag == 1){
                //Get attributes of the tag
                var obj = $(tag).attrs();
                //Get TagName of the tag
                obj["tagName"] = $(tag).prop("tagName").toLowerCase();
                //Show tagname in the form
                $("#editor-modal-tags-list").val(obj["tagName"]);
                $("#editor-modal-tags-list").data("combobox").refresh();
                //Disable the tag selection in the form
                $("#editor-modal-tags-list").combobox("disable");
                //Get attributes and show it in the form
                var attrnames = []
                var attrvals = []
                $.each(obj,function(key,value){
                    if (key != "tagName"){
                        attrnames.push(key);
                        attrvals.push(value);
                    }
                });
                for (var i=0;i<attrnames.length;i++){
                    $("#editor-modal-attrs-list tr:last").find("input[name='attrname']").val(attrnames[i]);
                    $("#editor-modal-attrs-list tr:last").find("input[name='attrval']").val(attrvals[i]);
                    $("#editor-modal-attrs-list").append(attritem);
                }
                $("#editor-modal-attrs-add").click();
            }

            //If the attribute add button is clicked
            $(document).off("click","#editor-modal-attrs-add").on("click","#editor-modal-attrs-add",function(){
                //Check if the last item has a value or not and accordingly extend the form
                var lastitem = $('input[name="attrname"]:last').val();
                if ( lastitem.length > 0){
                    $("#editor-modal-attrs-list").append(attritem);
                }
            });

            //If the "x" is click in the attribute list, then delete the row
            $(document).off("click",".delete-row a").on("click",".delete-row a",function(){
                if ($("#editor-modal-attrs-list tr").length != 1){
                    $($(this).parent("td")).parent("tr").remove();
                }
            });

            //If the ok button is click, clicked
            $(document).off("click","#editor-modal-true").on("click","#editor-modal-true",function(){
                //If it is a trailing tag, just hide the modal dialog
                if (istag == 0){
                    $("#editor-modal").modal('hide');
                }else{
                    //else check for tag errors
                    if ($("option:selected","#editor-modal-tags-list").val().length > 0){
                        $("#editor-modal-tags").removeClass("has-error");
                    }else{
                        $("#editor-modal-tags").addClass("has-error");
                    }
                    //Check for attribute errors
                    $("#editor-modal-attrs-list tr").each(function(i,row){
                        var attrname = $(row).find('input[name="attrname"]').val().toLowerCase();
                        if (attrname.length != 0){
                            if (attrname.indexOf("data-") == 0){
                                $(row).removeClass("danger");
                            }else{
                                if ($.inArray(attrname,data["attrs"]) == -1){
                                    $(row).addClass("danger");
                                }else{
                                    $(row).removeClass("danger");
                                }
                            }
                        }
                    });

                    //If no errors, generate string
                    if ($("#editor-modal-attrs-list tr").hasClass("danger") == false && $("option:selected","#editor-modal-tags-list").val().length > 0){
                        var s = "";
                        if (line.previous_lines.length > 0){
                            s += line.previous_lines + "\n" + line.current_line_start;
                        }else{
                            s += line.current_line_start;
                        }
                        s += "<"+$("option:selected","#editor-modal-tags-list").val();
                        $("#editor-modal-attrs-list tr").each(function(i,row){
                            var attrname = $(row).find('input[name="attrname"]').val().toLowerCase();
                            var attrval = $(row).find('input[name="attrval"]').val();
                            if (attrname.length != 0){
                                s += " "+attrname+'="'+attrval+'" ';
                            }
                        });
                        if (istag == 1){
                            s += ">";
                        }else{
                            s += "></"+$("option:selected","#editor-modal-tags-list").val()+">";
                        }

                        if (line.next_lines.length > 0){
                            s += line.current_line_end +"\n" + line.next_lines;
                        }else{
                            s += line.current_line_end;
                        }
                        console.log("string = "+s);
                        //Replace the text in the editor with "s"
                        $("#editor-textarea-body").val(s).focus();
                        //Set cursor position
                        $("#editor-textarea-body").textrange("setcursor",cursor["position"]).trigger("updateInfo");
                        //Hide Modal dialog
                        $("#editor-modal").modal('hide');
                    }
                }
            });
        }else if (value.indexOf("text") == 0){
            $("#editor-modal").html(modalStructure);
            $("#editor-modal-body").html(textboxStructure);
            $("#editor-modal-textarea-body").attr("rows","10");
            speech.removeCommands();
            speech.addCommands(cmds2);
            $(document).off("click","#editor-modal-true").on("click","#editor-modal-true",function(){
                if ($("#editor-modal-textarea-body").val().length > 0){
                    $("#editor-textarea-body").addText($("#editor-modal-textarea-body").val());
                }
                speech.removeCommands();
                speech.addCommands(default_cmds);
                speech.addCommands(cmds);
                $("#editor-modal").modal("hide");
            });

            $(document).off("click","#editor-modal-false,#editor-modal-header > a").on("click","#editor-modal-false,#editor-modal-header > a",function(){
                speech.removeCommands();
                speech.addCommands(default_cmds);
                speech.addCommands(cmds);
            });

        }

        //Generate everything and then show the modal
        $("#editor-modal").modal('show');
    });
}

//Check if it is a tag or not
var isTag = function(obj){
    var line = obj;
    //Check if the type of object passed is a string or not
    if ($.type(line.current_line) == "string" ){
        //Initialize cursor position
        var cpos = cursor["position"];
        //Check if cursor is in first line or not
        var cpos_init = cursor["position"] - line.current_line_start.length - line.previous_lines.length;
        if (cpos_init == 0){
            cpos = cpos - line.previous_lines.length;
        }else{
            cpos = cpos - line.previous_lines.length - 1;
        }
        var cstart = 0;
        var cend = 0;
        //Test is it is a tag
        for (var i = cpos; i >= 0; i--){
            if(line.current_line.charAt(i) == "<"){
                cstart = i;
                break;
            }
        }
        for (var i = cpos; i >= 0; i--){
            if (line.current_line.charAt(i) == ">"){
                cend = i;
                break;
            }
        }
        if (cstart > cend){
            for (var i = cpos; i <= line.current_line.length; i++){
                if (line.current_line.charAt(i) == ">"){
                    cend = i;
                    break;
                }
            }
        }

        var istag = false;
        if (cstart <= cend) {
            if (cpos - 1 <= cend && cpos > cstart){
                istag = true;
                if (cpos > cend){
                    istag = false;
                }
                if (cpos - 1 <= cstart){
                    istag = true;
                }
            }
            if (cstart == cend && cpos > cstart){
                istag = true
            }
        }
        console.log("cstart = "+cstart);
        console.log("cend = "+cend);
        console.log("cpos = "+cpos);
        console.log("istag = "+istag);
        //If it isnt a tag return -1
        if (istag == false){
            return -1;
        }else{
            for (var i = cpos; i <= line.current_line.length; i++){
                if (line.current_line.charAt(i) == ">"){
                    cend = i;
                    break;
                }
            }
            //else if it is a trailing tag then return 0
            if (line.current_line.substring(cstart,cend+1).indexOf("<") != -1 && line.current_line.substring(cstart,cend+1).indexOf(">") != -1){
                if (line.current_line.substring(cstart,cend+1).indexOf("/") != -1){
                    return 0;
                }else{
                    //else return 1 if it is a tag
                    return 1;
                }
            }else{
                return -1;
            }
        }
    }
}

// Main Commands
var cmds = {
    "add (a) (new) tag" : function(){ItemModal("tag");},
    "add (a) (new) element" : function(){ItemModal("tag");},
    "new tag" : function(){ItemModal("tag");},
    "new element" : function(){ItemModal("tag");},
    "edit (the) (this) tag" : function(){ItemModal("tag");},
    "edit (the) (this) element" : function(){ItemModal("tag");},
    "add (some) text" : function(){ItemModal("text");}
}

var cmds2 = {
    'add (a) (new) line' : function(){$("#editor-modal-textarea-body").addText("\n");},
    'remove (this) (the) text' : function(){
        $("#editor-modal-textarea-body").removeText();
    },
    'remove all' : function(){
        $("#editor-modal-textarea-body").removeText("all");
    },
    'remove everything' : function(){
        $("#editor-modal-textarea-body").removeText("all");
    },
    'remove (this) (the) line' : function(){
        $("#editor-modal-textarea-body").removeText("line");
    },
    "*val" : function(val){$("#editor-modal-textarea-body").addText(val);}
}

// Add the commands
speech.addCommands(cmds);
console.log(cmds);
//Listeners and events
$(document).off("click","#editor-edit-lbl").on('click',"#editor-edit-lbl",function(){
    ItemModal("tag");
});
