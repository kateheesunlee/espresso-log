import SwiftUI
import CoreData

struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \EspressoLogEntry.timestamp, ascending: false)],
        animation: .default)
    private var entries: FetchedResults<EspressoLogEntry>

    var body: some View {
        NavigationView {
            List {
                ForEach(entries) { entry in
                    NavigationLink {
                        EntryDetailView(entry: entry)
                    } label: {
                        EntryRowView(entry: entry)
                    }
                }
                .onDelete(perform: deleteEntries)
            }
            .navigationTitle("Espresso Log")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addEntry) {
                        Label("Add Entry", systemImage: "plus")
                    }
                }
            }
        }
    }

    private func addEntry() {
        withAnimation {
            let newEntry = EspressoLogEntry(context: viewContext)
            newEntry.timestamp = Date()
            newEntry.title = "New Espresso Entry"
            newEntry.content = ""

            do {
                try viewContext.save()
            } catch {
                // Replace this implementation with code to handle the error appropriately.
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }

    private func deleteEntries(offsets: IndexSet) {
        withAnimation {
            offsets.map { entries[$0] }.forEach(viewContext.delete)

            do {
                try viewContext.save()
            } catch {
                // Replace this implementation with code to handle the error appropriately.
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

struct EntryRowView: View {
    let entry: EspressoLogEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.title ?? "Untitled")
                .font(.headline)
                .lineLimit(1)
            
            if let content = entry.content, !content.isEmpty {
                Text(content)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            Text(entry.timestamp ?? Date(), style: .date)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 2)
    }
}

struct EntryDetailView: View {
    @ObservedObject var entry: EspressoLogEntry
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var title: String = ""
    @State private var content: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            TextField("Title", text: $title)
                .font(.title2)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            TextEditor(text: $content)
                .font(.body)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
            
            Spacer()
        }
        .padding()
        .navigationTitle("Espresso Entry")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    saveEntry()
                }
            }
        }
        .onAppear {
            title = entry.title ?? ""
            content = entry.content ?? ""
        }
    }
    
    private func saveEntry() {
        entry.title = title
        entry.content = content
        
        do {
            try viewContext.save()
            dismiss()
        } catch {
            let nsError = error as NSError
            fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView().environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
    }
}
