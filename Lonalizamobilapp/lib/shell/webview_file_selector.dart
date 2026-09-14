import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

/// Accept groups coming from `<input type="file" accept="...">`.
enum WebViewMediaAccept { image, video, media, any }

WebViewMediaAccept classifyWebViewAcceptTypes(Iterable<String> acceptTypes) {
  final joined = acceptTypes.map((type) => type.toLowerCase()).join(',');
  if (joined.trim().isEmpty) return WebViewMediaAccept.any;

  final wantsImage = _looksLikeImageAccept(joined);
  final wantsVideo = _looksLikeVideoAccept(joined);
  if (wantsImage && wantsVideo) return WebViewMediaAccept.media;
  if (wantsImage) return WebViewMediaAccept.image;
  if (wantsVideo) return WebViewMediaAccept.video;
  return WebViewMediaAccept.any;
}

FileType fileTypeForAccept(WebViewMediaAccept accept) {
  switch (accept) {
    case WebViewMediaAccept.image:
      return FileType.image;
    case WebViewMediaAccept.video:
      return FileType.video;
    case WebViewMediaAccept.media:
      return FileType.media;
    case WebViewMediaAccept.any:
      return FileType.any;
  }
}

String fileSelectorErrorJs(String message) {
  return "window.dispatchEvent(new CustomEvent('lonaliza-file-picker-error',{detail:${jsonEncode(message)}}));";
}

/// Android WebView ignores `<input type="file">` until this callback is set.
/// The Future is left open until the user finishes picking so large video
/// copies are not killed by a shell-side timeout.
Future<void> attachAndroidWebViewFileSelector(
  AndroidWebViewController controller, {
  void Function(String message)? onError,
  VoidCallback? onPicking,
  VoidCallback? onSettled,
}) {
  return controller.setOnShowFileSelector((params) async {
    onPicking?.call();
    try {
      return await pickFilesForWebView(params, onError: onError);
    } finally {
      onSettled?.call();
    }
  });
}

Future<List<String>> pickFilesForWebView(
  FileSelectorParams params, {
  void Function(String message)? onError,
}) async {
  if (params.mode == FileSelectorMode.save) {
    return const [];
  }

  final allowMultiple = params.mode == FileSelectorMode.openMultiple;
  var type = fileTypeForAccept(classifyWebViewAcceptTypes(params.acceptTypes));

  try {
    FilePickerResult? result;
    try {
      result = await FilePicker.platform.pickFiles(
        type: type,
        allowMultiple: allowMultiple,
        withData: false,
      );
    } catch (_) {
      if (type == FileType.any) rethrow;
      result = await FilePicker.platform.pickFiles(
        type: FileType.any,
        allowMultiple: allowMultiple,
        withData: false,
      );
    }

    if (result == null || result.files.isEmpty) {
      return const [];
    }

    final uris = <String>[];
    for (final file in result.files) {
      final path = file.path;
      if (path == null || path.isEmpty) continue;
      uris.add(Uri.file(path).toString());
    }
    if (uris.isEmpty) {
      onError?.call('تعذر قراءة الملف المختار. جرّب صورة أو فيديو آخر.');
    }
    return uris;
  } on PlatformException catch (error) {
    debugPrint('Lonaliza WebView file selector: ${error.code} ${error.message}');
    onError?.call(_messageForPlatformException(error));
    return const [];
  } catch (error) {
    debugPrint('Lonaliza WebView file selector: $error');
    onError?.call(
      'تعذر فتح معرض الصور أو الفيديو. تحقق من الأذونات وحاول مرة أخرى.',
    );
    return const [];
  }
}

bool _looksLikeImageAccept(String joined) {
  return joined.contains('image') ||
      joined.contains('.jpg') ||
      joined.contains('.jpeg') ||
      joined.contains('.png') ||
      joined.contains('.webp') ||
      joined.contains('.gif') ||
      joined.contains('.heic') ||
      joined.contains('.heif');
}

bool _looksLikeVideoAccept(String joined) {
  return joined.contains('video') ||
      joined.contains('.mp4') ||
      joined.contains('.mov') ||
      joined.contains('.webm') ||
      joined.contains('.m4v') ||
      joined.contains('.mkv');
}

String _messageForPlatformException(PlatformException error) {
  final code = error.code.toLowerCase();
  final message = (error.message ?? '').toLowerCase();
  if (code.contains('permission') ||
      code.contains('denied') ||
      code.contains('storage') ||
      message.contains('permission') ||
      message.contains('denied')) {
    return 'تعذر الوصول إلى المعرض. اسمح لتطبيق لوناليزا بالوصول إلى الصور والفيديو من إعدادات الجهاز.';
  }
  return 'تعذر اختيار الملف. حاول مرة أخرى.';
}
