class QRCodeModel {
  String? apiEndpoint;

  QRCodeModel({this.apiEndpoint});

  factory QRCodeModel.fromJson(Map<String, dynamic> json) {
    return QRCodeModel(
      apiEndpoint: json['apiEndpoint'],
    );
  }
}
