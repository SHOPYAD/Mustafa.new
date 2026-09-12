import 'dart:convert';
import 'dart:io';

void main() {
  try {
    final file = File('filejson.json');
    final rawString = file.readAsStringSync();
    final rawJson = jsonDecode(rawString);
    if (rawJson is List) {
      final first = rawJson.first;
      if (first is Map) {
        final data = first['data'];
        if (data is Map) {
          print('Keys inside data: ${data.keys.toList()}');
        } else {
          print('data is not a Map: $data');
        }
      } else {
        print('First element is not a Map: $first');
      }
    } else if (rawJson is Map) {
      final data = rawJson['data'];
      if (data is Map) {
        print('Keys inside data: ${data.keys.toList()}');
      } else {
        print('data is not a Map: $data');
      }
    } else {
      print('JSON is neither List nor Map: $rawJson');
    }
  } catch (e) {
    print('Error: $e');
  }
}
