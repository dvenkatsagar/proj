/*
    Speech to text editor
    Copyright (C) 2013-2015  Sagar DV <dvenkatsagar@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// jquery extended functions
$.fn.extend({
    /*Function called as $(selector).attrs().
    It extracts and all the attributes of the specified selector.
    It returns a object with the attributes as key-value pairs.*/
    attrs : function(){
        var obj = {};
        // loop through all attributes of the selector and return object
        $.each(this[0].attributes, function() {
            if(this.specified) {
                obj[this.name] = this.value;
            }
        });
        return obj;
    },
    /*Function called as $(selector).getLines().
    It gets the statistics of the lines in the text editor.
    It returns a object.*/
    getLines : function(){
        //Check if selector is textarea or input box
        if ($(this).is("textarea,input") == false){
            console.log("Not a textarea or input");
            return null;
        }
        var line = {}
        //Get cursor statistics
        var curs = $(this).textrange();
        //Get all lines
        line.lines = $(this).val().substring(0, $(this).val().length).split("\n");
        //Get array of lines from start to current line with respect to the cursor position
        line.lines_start = $(this).val().substring(0, curs["start"]).split("\n");
        //Get array of lines from current line to end with respect to the cursor position
        line.lines_end = $(this).val().substring(curs["start"],$(this).val().length).split("\n");
        //Get array of lines above the cursor position
        var previous = line.lines_start.slice(0,-1);
        //Get array of lines below cursor position
        var next = line.lines_end.slice(1,line.lines_end.length);
        //Get current line no
        line.current_line_no = line.lines_start.length;
        //Get text of current line with respect to the cursor
        line.current_line = line.lines[line.current_line_no - 1];
        //Join array "previous" as string
        line.previous_lines = previous.join("\n");
        //Join array "next" as string
        line.next_lines = next.join("\n");
        //Get text of current line before cursor position
        line.current_line_start = line.lines_start[line.lines_start.length - 1];
        //Get text of current line after cursor position
        line.current_line_end = line.lines_end[0];
        //return object
        return line
    },
    /*Function called as $(selector).addText().
    Adds text to input box with respect to the cursor position.*/
    addText : function(val){
        //Check of selector is textarea or input box
        if ($(this).is("textarea,input[type='text']") == false){
            console.log("Not a textarea or input");
        }else{
            //Get Lines statistics
            var line = $(this).getLines();
            //Get Cursor statistics
            var curs = $(this).textrange();
            //Initialize cpos
            var cpos = 0
            //Get text upto cursor position
            var lines_start = line.lines_start.join("\n");
            //Get text from cursor position to end
            var lines_end = $(this).val().substring(curs["end"],$(this).val().length);
            //Generate string
            s = lines_start + " " + val;
            //Check if there is no text after cursor and set cpos accordingly
            if (lines_end.length > 0){
                cpos = s.length;
            }else{
                cpos = s.length + 1;
            }
            s += " " + lines_end;
            console.log(s);
            //Replace text in textarea with "s"
            $(this).val(s).focus();
            //Set cursor position of textarea
            $(this).textrange("setcursor",cpos).trigger("updateInfo");
        }
    },
    /*Function called as $(selector).removeText().
    Remove text in input box with respect to the cursor position.*/
    removeText : function(val){
        //Check if selector is textarea or input
        if ($(this).is("textarea,input") == false){
            console.log("Not a textarea or input");
        }else{
            //Get cursor statistics
            var curs = $(this).textrange();
            //Get line statistics
            var line = $(this).getLines();
            //Check if the words "all" or "line" is said by the user and set selection of text accordingly.
            if (val == "all"){
                curs["start"] = 0;
                curs["end"] = $(this).val().length;
            }else if(val == "line"){
                curs["start"] = line.previous_lines.length;
                curs["end"] = line.previous_lines.length + line.current_line.length;
            }
            //If there is no selection, remove the text
            if (curs["start"] != curs["end"]){
                var lines_start = $(this).val().substring(0, curs["start"]);
                var lines_end = $(this).val().substring(curs["end"],$(this).val().length);
                //Generate the string
                s = lines_start + lines_end;
                //Replace text of inputbox with "s"
                $(this).val(s);
                //Set cursor position
                $(this).textrange("setcursor",curs["start"]).trigger("updateInfo");
            }
        }
    },
});

//Function called when user says "new file" or click the "new" button in "file" menu
var newFile = function(){
    //Get value of textarea
    var value = $("#editor-textarea-body").val();
    //If there is text in the textarea, then show warning
    if (value.length > 0){
        $("#editor-modal").html(modalStructure);
        $(".modal-dialog").removeClass("modal-lg");
        $("#editor-modal-lbl").html("Unsaved Changes will be lost");
        $("#editor-modal-body").html("Changes haven't been saved, you will lose all the data. <br /> Do you want to continue?");
        $("#editor-modal-true").html("Continue");
        //If user clicks on "continue" button, then clear textarea else dont
        $(document).off("click","#editor-modal-true").on("click","#editor-modal-true",function(){
            $("#editor-textarea-body").val("");
            $("#editor-modal").modal("hide");
        });
        $("#editor-modal").modal();
    }
}

//Function called when user either says "show help" or clicks the help button
var showHelp = function(){
    $("#editor-modal").html(modalStructure);
    //$(".modal-dialog").removeClass("modal-lg");
    $("#editor-modal-lbl").html("<h3>Help</h3>");

    $("#editor-modal-body").html(helpStructure);
    $("#editor-modal-help-gen-lbl").html("General Commands");
    $("#editor-modal-help-spec-lbl").html("Commands related to "+$("#editor-lang-lbl").text());
    $.each(default_help,function(key,value){
        var help_gen_list_item =    '<tr>'+
                                        '<td>'+key+'</td>'+
                                        '<td>'+value+'</td>'+
                                    '</tr>';
        $("#editor-modal-help-gen-list").append(help_gen_list_item);
    });
    var lang = $("#editor-lang-lbl").data("val");
    if (lang != "txt"){
        $.getJSON("./public/res/languages/language-"+lang+".json",function(data){
            $.each(data["help"],function(key,value){
                var help_spec_list_item =    '<tr>'+
                                                '<td>'+key+'</td>'+
                                                '<td>'+value+'</td>'+
                                            '</tr>';
                $("#editor-modal-help-spec-list").append(help_spec_list_item);
            });
        });
    }

    $("#editor-modal-false").hide();
    $(document).off("click","#editor-modal-true").on("click","#editor-modal-true",function(){
        $("#editor-modal").modal("hide");
    });
    $("#editor-modal").modal();
}

// Refreshes the lines of textarea,
var refreshLines = function() {
    var nLines = $("#editor-textarea-body").val().split("\n").length;
    $("#editor-textarea-lineno").html('');
    for (i=1; i<=nLines; i++) {
        $("#editor-textarea-lineno").html($("#editor-textarea-lineno").html() + i +"\n");
    }
    $("#editor-textarea-lineno").scrollTop($("#editor-textarea-body").scrollTop());
}

// Formats strings
var format = function(s) {
    return linebreak(capitalize(s));
}

// Checks for line brakes and replaces them
var linebreak = function(s) {
    return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>');
}

// Captalizes the works
var captalize = function(s) {
    return s.replace(/\S/, function (m) {
        return m.toUpperCase();
    });
}

//Variable defining the structure of the modal dialog
var modalStructure = '<div class="modal-dialog modal-lg">'+
                '<div class="modal-content">'+
                    '<div class="modal-header" id="editor-modal-header">'+
                        '<a type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></a>'+
                        '<h4 class="modal-title" id="editor-modal-lbl">Item Properties</h4>'+
                    '</div>'+
                    '<div class="modal-body" id="editor-modal-body">'+
                    '</div>'+
                    '<div class="modal-footer" id="editor-modal-footer">'+
                        '<a type="button" class="btn btn-danger" data-dismiss="modal" id="editor-modal-false">Cancel</a>'+
                        '<a type="button" class="btn btn-success" id="editor-modal-true">Ok</a>'+
                    '</div>'+
                '</div>'+
            '</div>';

var helpStructure = '<div class="container-fluid">'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<span>Just try one of the following voice commands, and it\'ll work.</span>'+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<span>Words in () are optional.</span>'+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<span>Words in [] are a choice.</span>'+
                            '</div>'+
                        '</div>'+
                        '<br />'+
                        '<div class="scrollable row">'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<div class="panel panel-primary">'+
                                    '<div class="panel-heading" id="editor-modal-help-gen-lbl">'+
                                    '</div>'+
                                    '<table class="table table-striped table-responsive table-condensed">'+
                                        '<thead>'+
                                            '<tr>'+
                                                '<th>Command to say</th>'+
                                                '<th>what it does</th>'+
                                            '</tr>'+
                                        '</thead>'+
                                        '<tbody id="editor-modal-help-gen-list">'+
                                        '</tbody>'+
                                    '</table>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<hr />'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<div class="panel panel-primary">'+
                                    '<div class="panel-heading" id="editor-modal-help-spec-lbl">'+
                                    '</div>'+
                                    '<table class="table table-striped table-responsive table-condensed">'+
                                        '<thead>'+
                                            '<tr>'+
                                                '<th>Command to say</th>'+
                                                '<th>what it does</th>'+
                                            '</tr>'+
                                        '</thead>'+
                                        '<tbody id="editor-modal-help-spec-list">'+
                                        '</tbody>'+
                                    '</table>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '</div>'+
                        '<hr />'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                '<span><b><u>Project Details :</u></b></span>'+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                "<span>Authors : <a href='mailto:dvenkatsagar@gmail.com'>Sagar D.V</a>, <a href='mailto:lloyd24390@yahoo.com'>Nikhil L Cordeiro</a>, <a href='mailto:jatinsinghunb@gmail.com'>Jatin Singh</a></span>"+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                "<span>Maintainer : <a href='mailto:dvenkatsagar@gmail.com'>Sagar D.V</a></span>"+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                "<span>Src Code Page : <a href='https://gitlab.com/dvenkatsagar/speech-editor'>https://gitlab.com/dvenkatsagar/speech-editor</a></span>"+
                            '</div>'+
                        '</div>'+
                        '<div class="row">'+
                            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">'+
                                "<span>Src Code : <a href='https://gitlab.com/dvenkatsagar/speech-editor/repository/archive.zip'>Download</a></span>"+
                            '</div>'+
                        '</div>'+
                    '</div>';

//Global definitions
var cursor = {};
//Default voice commands
var default_cmds = {
    '(show) help (me)' : function(){showHelp();},
    '(open) (create) (a) new file': function(){newFile();},
    'add (a) (new) line' : function(){$("#editor-textarea-body").addText("\n");},
    'create (a) (new) line' : function(){$("#editor-textarea-body").addText("\n");},
    'remove (this) (the) text' : function(){
        $("#editor-textarea-body").removeText();
    },
    'remove all' : function(){
        $("#editor-textarea-body").removeText("all");
    },
    'remove everything' : function(){
        $("#editor-textarea-body").removeText("all");
    },
    'remove (this) (the) line' : function(){
        $("#editor-textarea-body").removeText("line");
    },
};

var default_help = {
    "(show) help (me)" : "Show this help dialog.",
    "(open) (create) (a) new file" : "Creates a new file.",
    "[add|create] (a) (new) line" : "Inserts a new line",
    "remove (this) (the) text" : "Removes the selected text.",
    "remove [all|everything]" : "Removes the entire text in the editor.",
    "remove (this) (the) line" : "Removes the line where the cursor is on."
}

// Main function
$(document).ready(function(){
    // Once Doc is ready load page
    $("#page").load("./views/editor.html",function (){
        //Initial set the number of rows of textarea to 10
        $("textarea").attr("rows","10");
        // When scrolling update the Line numbers of the textarea
        $("#editor-textarea-body").on("scroll",function () {
            $("#editor-textarea-lineno").scrollTop(-$(this).scrollTop());
        });

        //When textarea is either focus or blured or scrolled, etc, refresh the lines
        $("#editor-textarea-body").on("keyup focus blur scroll",function () {
            refreshLines();
        });

        //Update the cursor statistics when textarea is accessed
        $("#editor-textarea-body").on('updateInfo keyup keydown mousedown mouseup scroll', function() {
            cursor = $(this).textrange();
            console.log(cursor);
        });

        //If Language is plain text, disable the "edit" button
        if ($("#editor-lang-lbl").data("val") == "txt"){
            $("#editor-edit-lbl").addClass("disabled");
        }

        //If language is selected, change language label to selected language
        $(document).on("click","#editor-lang-opts li",function(){
            var text = $(this).children().text();
            if($(this).hasClass("disabled") != true){
                $("#editor-lang-lbl").text(text);
            }
        });

        //If file menu are selected do the specific task,
        $(document).on('click',"#editor-file-opts li a",function(){
            var fopt = $(this).data("val");
            if(fopt == "new"){
                newFile();
            }
        });

        //If Help button is clicked
        $(document).on("click","#editor-help-btn",function(){
            showHelp();
        });

        //Check if speech voice engine works or not
        if (!speech){
            //If speech isnt supported, do this
            $("#editor").hide();
            $("#unsupported").removeClass("hidden");
        }else{
            //If speech is supported
            var speechstarted = false;
            //Set language of speech
            speech.setLanguage('en-IN');
            //Set debug to on
            speech.debug();
            //Load Default commands
            speech.addCommands(default_cmds);
            //Load Plain text Language script
            $.getScript("./public/res/languages/language-txt.js");
            //If language is selected, get specific language commands
            $(document).on('click',"#editor-lang-opts li a",function(){
                // Get Language from the language menu
                var lang = $(this).data("val");
                $("#editor-lang-lbl").data("val",lang);
                //If it is plain text, disable edit label
                if ($("#editor-lang-lbl").data("val") == "txt"){
                    $("#editor-edit-lbl").addClass("disabled");
                }else{
                    //else enable it
                    $("#editor-edit-lbl").removeClass("disabled");
                }
                //Remove all commands
                speech.removeCommands();
                //Load default Commands
                speech.addCommands(default_cmds);
                //Get language script file with commands and execute it
                $.getScript("./public/res/languages/language-" + lang + ".js");
            });

            //If mic is clicked, start speech, else stop
            $(document).on("click","#editor-mic",function(){
                if($("#editor-mic-icon").hasClass("fa-microphone") == true){
                    console.log("recognition started");
                    speechstarted = true;
                    speech.start();
                    //Change state of Mic image
                    $("#editor-mic-icon").removeClass("fa-microphone");
                    $("#editor-mic-icon").addClass("fa-microphone-slash");
                }else{
                    console.log("recognition stopped");
                    speechstarted = false;
                    speech.abort();
                    $("#editor-mic-icon").removeClass("fa-microphone-slash");
                    $("#editor-mic-icon").addClass("fa-microphone");
                }
            });
        }
    });
});
