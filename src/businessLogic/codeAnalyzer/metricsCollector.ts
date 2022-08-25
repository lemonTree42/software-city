import {BaseJavaCstVisitorWithDefaults} from 'java-parser';
import {ProcessedComponent} from '../../dataLayer/model/projectData/processed/processedComponent';
import {JavaClass} from '../../dataLayer/model/projectData/processed/javaItems/javaClass';
import {JavaInterface} from '../../dataLayer/model/projectData/processed/javaItems/javaInterface';
import {JavaEnum} from '../../dataLayer/model/projectData/processed/javaItems/javaEnum';
import {Metrics} from '../../dataLayer/model/projectData/processed/javaItems/metrics';
import {JavaItem} from '../../dataLayer/model/projectData/processed/javaItems/javaItem';

export class MetricsCollector extends BaseJavaCstVisitorWithDefaults {
  private packagePath = ['default'];

  constructor(
    private customResult: ProcessedComponent,
    private javaFile: string) {
    super();
    this.validateVisitor();
  }

  packageDeclaration(ctx) {
    const packageIdentifiers = ctx.Identifier;
    const names: string[] = [];
    packageIdentifiers.forEach((id) => {
      names.push(id.image);
    });
    this.packagePath = names;
  }

  typeDeclaration(ctx) {
    let javaItem: JavaItem;
    let name: string;
    if (ctx.classDeclaration) {
      if (ctx.classDeclaration[0].children.enumDeclaration) {
        name = ctx.classDeclaration[0].children.enumDeclaration[0].children.typeIdentifier[0].children.Identifier[0].image;
        const metrics = this.readEnumMetrics(ctx);
        javaItem = new JavaEnum(name, metrics);
      } else {
        name = ctx.classDeclaration[0].children.normalClassDeclaration[0].children.typeIdentifier[0].children.Identifier[0].image;
        const metrics = this.readClassMetrics(ctx);
        javaItem = new JavaClass(name, metrics);
      }
    } else if (ctx.interfaceDeclaration) {
      name = ctx.interfaceDeclaration[0].children.normalInterfaceDeclaration[0].children.typeIdentifier[0].children.Identifier[0].image;
      const metrics = this.readInterfaceMetrics(ctx);
      javaItem = new JavaInterface(name, metrics);
    }
    this.customResult.addJavaItem(name!, [...this.packagePath], javaItem!);
  }

  private readInterfaceMetrics(ctx: any) {
    const fieldCount = ctx.interfaceDeclaration[0].children.normalInterfaceDeclaration[0].children
        .interfaceBody[0].children?.interfaceMemberDeclaration?.reduce((acc, e) => {
          return acc + ((e?.children?.constantDeclaration) ? 1 : 0);
        }, 0) || 0;
    return this.readMetrics(ctx.interfaceDeclaration[0], fieldCount);
  }

  private readClassMetrics(ctx: any) {
    const fieldCount = ctx.classDeclaration[0].children.normalClassDeclaration[0].children.classBody[0].children?.classBodyDeclaration?.reduce((acc, e) => {
      const member = e?.children?.classMemberDeclaration;
      return acc + ((member && member[0]?.children?.fieldDeclaration) ? 1 : 0);
    }, 0) || 0;
    return this.readMetrics(ctx.classDeclaration[0], fieldCount);
  }

  private readEnumMetrics(ctx: any) {
    const enumBodyDeclarations = ctx.classDeclaration[0].children.enumDeclaration[0].children.enumBody[0].children?.enumBodyDeclarations;
    let fieldCount = 0;
    if (enumBodyDeclarations) {
      fieldCount = enumBodyDeclarations.children?.classBodyDeclaration?.reduce((acc, e) => {
        const member = e?.children?.classMemberDeclaration;
        return acc + ((member && member[0]?.children?.fieldDeclaration) ? 1 : 0);
      }, 0) || 0;
    }
    return this.readMetrics(ctx.classDeclaration[0], fieldCount);
  }

  private readMetrics(ctx, fieldCount: number): Metrics {
    const sourceCode = this.javaFile.substring(ctx.location.startOffset, ctx.location.endOffset + 1);
    const lineCount = ctx.location.endLine - ctx.location.startLine + 1;
    const methodCount = (sourceCode.match(/(public|protected|private|static|\s) +[\w\<\>\[\]]+\s+(\w+) *\([^\)]*\) *(\{?|[^;])/g) || []).length;
    const containsMainMethod = (sourceCode.match(/public static void main\([^\)]*\) *(\{?|[^;])/g) || []).length>0;
    const modifiers: string[] = [];
    ctx.children?.classModifier?.forEach((m) => {
      modifiers.push(Object.keys(m.children)[0].toLowerCase());
    });
    return new Metrics(sourceCode, lineCount, methodCount, fieldCount, modifiers, this.packagePath.join('.'), containsMainMethod);
  }
}
