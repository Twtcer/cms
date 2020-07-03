﻿var $url = '/shared/imageLayerUpload';

var data = utils.init({
  attributeName: utils.getQueryString('attributeName'),
  no: utils.getQueryInt('no'),
  editorAttributeName: parent.$vue.getEditorAttributeName && parent.$vue.getEditorAttributeName(),
  uploadUrl: null,
  dialogImageUrl: '',
  dialogVisible: false,
  form: {
    siteId: utils.getQueryInt('siteId'),
    isOptions: false,
    isEditor: false,
    isThumb: false,
    thumbWidth: 500,
    thumbHeight: 500,
    isLinkToOriginal: true,
    filePaths: []
  }
});

var methods = {
  insert: function(no, result) {
    parent.$vue.insertText(this.attributeName, no, result.imageVirtualUrl);
    if (this.editorAttributeName && this.form.isEditor) {
      var html = '<img src="' + result.imageUrl + '" style="border: 0; max-width: 100%" />';
      if (result.previewUrl) {
        var vueHtml = '<el-image src="' + result.imageUrl + '" style="border: 0; max-width: 100%"></el-image>';
        html = '<img data-vue="' + encodeURIComponent(vueHtml) + '" src="' + result.imageUrl + '" style="border: 0; max-width: 100%" />';
      }
      parent.$vue.insertEditor(this.editorAttributeName, html);
    }
  },

  apiGet: function() {
    var $this = this;

    utils.loading(this, true);
    $api.get($url, {
      params: {
        siteId: this.form.siteId
      }
    }).then(function(response) {
      var res = response.data;

      $this.form.isOptions = true;
      $this.form.isEditor = res.isEditor;
      $this.form.isThumb = res.isThumb;
      $this.form.thumbWidth = res.thumbWidth;
      $this.form.thumbHeight = res.thumbHeight;
      $this.form.isLinkToOriginal = res.isLinkToOriginal;
    })
    .catch(function(error) {
      utils.error(error);
    })
    .then(function() {
      utils.loading($this, false);
    });
  },

  btnSubmitClick: function () {
    var $this = this;

    if (this.form.filePaths.length === 0) {
      utils.error('请选择需要插入的图片文件！');
      return false;
    }

    utils.loading(this, true);
    $api.post($url, this.form).then(function(response) {
      var res = response.data;

      if (res && res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          var result = res[i];
          $this.insert($this.no + i, result);
        }
      }
      
      utils.closeLayer();
    })
    .catch(function(error) {
      utils.error(error);
    })
    .then(function() {
      utils.loading($this, false);
    });
  },

  btnCancelClick: function () {
    utils.closeLayer();
  },

  uploadBefore(file) {
    var isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      utils.error('上传图片大小不能超过 10MB!');
      return false;
    }
    return true;
  },

  uploadProgress: function() {
    utils.loading(this, true);
  },

  uploadSuccess: function(res) {
    this.form.filePaths.push(res.path);
    utils.loading(this, false);
  },

  uploadError: function(err) {
    utils.loading(this, false);
    var error = JSON.parse(err.message);
    utils.error(error.message);
  },

  uploadRemove(file) {
    if (file.response) {
      this.form.filePaths.splice(this.form.filePaths.indexOf(file.response.path), 1);
    }
  },

  uploadPictureCardPreview(file) {
    this.dialogImageUrl = file.url;
    this.dialogVisible = true;
  }
};

var $vue = new Vue({
  el: '#main',
  data: data,
  methods: methods,
  created: function () {
    this.uploadUrl = $apiUrl + $url + '/actions/upload?siteId=' + this.form.siteId;
    if (this.form.siteId && this.editorAttributeName) {
      this.apiGet();
    } else {
      utils.loading(this, false);
    }
  }
});