# Regras do R8 para o build de release.
#
# As regras de reflexão do Capacitor (plugins anotados com @CapacitorPlugin e
# subclasses de com.getcapacitor.Plugin) já vêm do `consumerProguardFiles` da
# própria biblioteca — não precisa repetir aqui. O que fica neste arquivo é o
# que é específico deste app.

# O bridge Capacitor injeta objetos Java na WebView via @JavascriptInterface.
# Sem isto, o R8 renomeia os métodos e a ponte JS→nativo some no release.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# A ponte lê o nome das classes de plugin do capacitor.plugins.json em tempo
# de execução (Class.forName), então elas não podem ser renomeadas.
-keep class br.com.mentorque.app.** { *; }

# Mantém números de linha nos stack traces do Play Console (o mapping.txt
# enviado junto com o .aab desofusca o resto).
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
