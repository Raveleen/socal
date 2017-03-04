/**
 * Created by Святослав on 12.01.2017.
 */
$(document).on('change', ':file', function () {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});
$(document).ready(function () {
    $("#create-post-button").prop("disabled", true);
    $(".create-comment-button").prop("disabled", true);
    var flag_file = 0;
    var flag_text = 0;
    var load_more_comments = "<div id=\"load-more-comments\" class=\"appended-result\"><div class=\"row search-result\"><div class=\"col-sm-12\"><hr class=\"middle\"></div><div class=\"col-sm-12 load-more\"><a id=\"load-comments-href\"><span id=\"plus\" class=\"glyphicon glyphicon-plus\"></span><span class=\"glyphicon glyphicon-menu-up hidden\"></span></a></div><div class=\"col-sm-12\"><hr class=\"middle\"></div></div></div>";
    var comments_from = 0;
    var comments_flag = true;
    //FIRST ACTIONS ON LOAD.
    $("#arrow-up").hide();
    $("#arrow-up").removeClass("hidden");
    $("#create-post-form-div").hide();
    $("#create-post-form-div").removeClass("hidden");
    //_Counter of symbols
    $("#post-text").keyup(function () {
        if ($("#post-text").val().length == 0) {
            flag_text = 0;
        }
        if ($("#post-text").val().length > 0) {
            flag_text = 1;
        }
        if ((flag_file + flag_text) == 2) {
            $("#create-post-button").prop("disabled", false);
        } else {
            $("#create-post-button").prop("disabled", true);
        }
        $("#characters-number").text(5000 - $("#post-text").val().length);
    });
    //_Arrow, which opens form
    $("#arrow-down").click(function () {
        if ($("#arrow-down").is(":visible")) {
            $("#arrow-down").hide();
            if ($("#arrow-up").is(":hidden")) {
                $("#arrow-up").show();
                $("#create-post-form-div").slideDown();
            }
        }
    });
    //_Arrow, which closes form
    $("#arrow-up").click(function () {
        if ($("#arrow-up").is(":visible")) {
            $("#arrow-up").hide();
            if ($("#arrow-down").is(":hidden")) {
                $("#arrow-down").show();
                $("#create-post-form-div").slideUp();
            }
        }
    });
    //_Controls file input
    $(':file').on('fileselect', function (event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        if (numFiles == 0) {
            if (input.length) {
                input.val(log);
            } else {
                if (log) alert(log);
            }
            flag_file = 0;
            $("#create-post-button").prop("disabled", true);
        } else {
            if (input.length) {
                input.val(log);
            } else {
                if (log) alert(log);
            }
            flag_file = 1;
            if ((flag_file + flag_text) == 2) {
                $("#create-post-button").prop("disabled", false);
            }
        }

    });
    //COMMENTS.comment-text
    //_Opening comments when clicking on "comments" line.
    $(document.body).on("click", ".comment-button", function () {
        if($(this).closest(".post").find(".comment-text").val().length == 0) {
            $(this).closest(".post").find(".create-comment-button").prop("disabled", true);
        } else {
            $(this).closest(".post").find(".create-comment-button").prop("disabled", false);
        }
        comments_from = 0;
        comments_flag = true;
        var id = $(this).closest(".post").attr("id");
        $(".comment").remove();
        $(".post-comments").hide();
        var a = $("#" + id).find(".post-comments");
        a.removeClass("hidden");
        a.show();
        var b = a.find(".comment-container");
        $.ajax({
            url: '/get-comments/' + id + '/0',
            type: 'GET',
            contentType: false,
            processData: false,
            success: function(data) {
                var i = 0;
                var array = data;
                if (array[0] == null) {
                } else {
                    while (i < data.length) {
                        b.prepend('' + array[i]);
                        if ((i == data.length - 1 ) && (data.length < 10)) {
                        } else if ((i == data.length - 1 ) && (data.length = 10)) {
                            b.prepend('' + load_more_comments);
                        }
                        i++;
                    }
                }
            }
        })
    });
    //_Delete comment
    $(document.body).on("click", ".delete-button-comment", function () {
        var comment_id = $(this).closest(".comment").attr("id");
        var id = $(this).closest(".post").attr("id");
        $.ajax({
            url: '/comment-delete/' + comment_id,
            type: 'POST',
            contentType: false,
            processData: false,
            success: function() {
                $("#" + comment_id).remove();
                comments_from -= 1;
                var temp = parseInt($("#" + id).find(".comments-number").text());
                $("#" + id).find(".comments-number").text(temp - 1);
            }
        })
    });
    //_Create comment
    $(document.body).on("click", ".create-comment-button", function () {
        $(this).closest(".post").find(".create-comment-button").prop("disabled", true);
        var id = $(this).closest(".post").attr("id");
        var a = $("#" + id).find(".post-comments");
        var b = a.find(".comment-container");
        var c = document.getElementById('form-' + id);
        var formData = new FormData(c);
        $.ajax({
            url: '/comment-create/' + id,
            data: formData,
            type: 'POST',
            contentType: false,
            processData: false,
            success: function(data) {
                b.append(data);
                document.getElementById('form-' + id).reset();
                $(this).prop("disabled", true);
                comments_from += 1;
                var temp = parseInt($("#" + id).find(".comments-number").text());
                $("#" + id).find(".comments-number").text(temp + 1);
            }
        })
    });
    $(document.body).on("keyup", ".comment-text", function () {
        var id = $(this).closest(".post").attr("id");
        var a = $("#" + id).find(".create-comment-button");
        if($(this).val().length == 0) {
            a.prop("disabled", true);
        } else {
            a.prop("disabled", false);
        }
    });
    //_Load +10 comments
    $(document.body).on("click", "#load-comments-href", function () {
        comments_from += 10;
        var id = $(this).closest(".post").attr("id");
        var a = $("#" + id).find(".post-comments");
        var b = a.find(".comment-container");
        $("#load-more-comments").remove();
        $.ajax({
            url: '/get-comments/' + id + '/' + comments_from,
            type: 'GET',
            contentType: false,
            processData: false,
            success: function(data) {
                var i = 0;
                var array = data;
                if (array[0] == null) {
                } else {
                    while (i < data.length) {
                        b.prepend('' + array[i]);
                        if ((i == data.length - 1 ) && (data.length < 10)) {
                        } else if ((i == data.length - 1 ) && (data.length = 10)) {
                            b.prepend('' + load_more_comments);
                        }
                        i++;
                    }
                }
            }
        })
    });
});